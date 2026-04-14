import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, PaginationMeta, User } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { ColumnDef, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown, Trash2, Plus, Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import ConfirmDeleteDialog from '@/components/confirm-delete-dialog';
import DataTablePagination from '@/components/datatable-pagination';
import DataTable from '@/components/datatable';
import { dateTimeFormatOptions } from '@/lib/utils';
import { RowActions } from '@/components/row-actions';
import CustomerForm from './form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tableau de bord', href: route('dashboard') },
    { title: "Clients", href: '#' },
];

interface PageProps {
    customers: {
        data: User[];
        meta: PaginationMeta;
    };
    filters: {
        search?: string;
        sort?: string;
        per_page?: number;
    },
}

export default function Index({ customers, filters }: PageProps) {
    const isMobile = useIsMobile();

    const [search, setSearch] = useState(filters.search ?? "");
    const [sort, setSort] = useState("");
    const [perPage, setPerPage] = useState<number>(filters.per_page ?? 10);
    const [deleteCustomer, setDeleteCustomer] = useState<User | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

    const [creatingCustomer, setCreatingCustomer] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<User | null>(null);

    const toggleSort = (column: keyof User) => {
        let dir: "asc" | "desc" | "" = "asc";
        if (sort === column) dir = "desc";
        else if (sort === "-" + column) dir = "";
        const newSort = dir === "" ? "" : dir === "desc" ? "-" + column : String(column);
        setSort(newSort);
        applyFilters({ sort: newSort });
    }

    const applyFilters = (newFilters: Partial<PageProps["filters"]> & { page?: number }) => {
        router.get(route('customers.index'), {
            search,
            sort,
            per_page: perPage,
            page: customers.meta.current_page,
            ...newFilters,
        }, { preserveState: true, replace: true });
    }

    const handleEdit = (customer: User) => setEditingCustomer(customer);
    const handleShow = (customer: User) => setEditingCustomer(customer);

    const handleDelete = (customer: User) => {
        setDeleteCustomer(customer);
        setIsDialogOpen(true);
    };

    const handleBulkDelete = () => {
        if (Object.keys(rowSelection).length > 0) {
            setDeleteCustomer(null);
            setIsDialogOpen(true);
        }
    };

    const columns = useMemo<ColumnDef<User>[]>(() => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected()
                            ? true
                            : table.getIsSomePageRowsSelected()
                                ? "indeterminate"
                                : false
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                />),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "name",
            header: () => (
                <Button variant="ghost" onClick={() => toggleSort("name")}>
                    Nom <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => row.original.name,
        },
        {
            accessorKey: "email",
            header: () => (
                <Button variant="ghost" onClick={() => toggleSort("email")}>
                    E-mail <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => row.original.email ? row.original.email : <span className="italic text-muted-foreground">Aucun téléphone</span>,
        },
        {
            accessorKey: "phone",
            header: () => 'Téléphone',
            cell: ({ row }) => row.original.phone ? row.original.phone : <span className="italic text-muted-foreground">Aucun téléphone</span>,
        },
        {
            accessorKey: "address",
            header: () => 'Adresse',
            cell: ({ row }) => row.original.address ? row.original.address : <span className="italic text-muted-foreground">Aucune adresse</span>,
        },
        {
            accessorKey: "created_at",
            header: () => (
                <Button variant="ghost" onClick={() => toggleSort("created_at")}>
                    Créé le <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const date = new Date(row.original.created_at);
                return date.toLocaleString("fr-FR", dateTimeFormatOptions);
            }
        },
        {
            accessorKey: "updated_at",
            header: () => (
                <Button variant="ghost" onClick={() => toggleSort("updated_at")}>
                    Modifié le <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const date = new Date(row.original.updated_at);
                return date.toLocaleString("fr-FR", dateTimeFormatOptions);
            }
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <RowActions
                    row={row.original}
                    onShow={handleShow}
                    onEdit={handleEdit}
                    showRoute={route('customers.show', row.original.id)}
                    onDelete={handleDelete}
                />
            ),
        }
    ], [sort]);

    const table = useReactTable({
        data: customers.data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: { rowSelection },
        onRowSelectionChange: setRowSelection,
    });

    const handleRowSelectionChange = (updaterOrValue: Record<string, boolean> | ((old: Record<string, boolean>) => Record<string, boolean>)) => {
        const newValue = typeof updaterOrValue === "function" ? updaterOrValue(rowSelection) : updaterOrValue;
        setRowSelection(newValue);
    };

    return (
        <AppLayout breadcrumbs={isMobile ? [] : breadcrumbs}>
            <Head title="Clients" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="flex justify-end flex-wrap">
                    <Button
                        className="ml-2"
                        onClick={() => setCreatingCustomer(true)}
                    >
                        <Plus className="h-4 w-4" /> Ajouter un client
                    </Button>
                </div>
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
                        <p className="text-sm text-muted-foreground">Gérez les clients.</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className='relative'>
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={isMobile ? "Rechercher..." : "Rechercher un client..."}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && applyFilters({ page: 1 })}
                                className="px-8 flex-1 md:w-[260px] text-sm focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-transparent"
                            />
                        </div>
                        {Object.keys(rowSelection).length > 0 && (
                            <Button variant="destructive" onClick={handleBulkDelete}>
                                <Trash2 className="mr-1 h-4 w-4" /> Supprimer {Object.keys(rowSelection).length}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <DataTable<User>
                    data={customers.data}
                    columns={columns}
                    rowSelection={rowSelection}
                    onRowSelectionChange={handleRowSelectionChange}
                    emptyMessage="Aucun client trouvé."
                />

                {/* Pagination */}
                <DataTablePagination
                    meta={customers.meta}
                    perPage={perPage}
                    onPageChange={(page) => applyFilters({ page })}
                    onPerPageChange={(val) => {
                        setPerPage(val);
                        applyFilters({ per_page: val, page: 1 });
                    }}
                />
            </div>
            <CustomerForm
                open={creatingCustomer || !!editingCustomer}
                onClose={() => {
                    setCreatingCustomer(false);
                    setEditingCustomer(null);
                }}
                customer={editingCustomer}
                submitUrl={
                    editingCustomer
                        ? route('customers.update', editingCustomer.id)
                        : route('customers.store')
                }
                method={editingCustomer ? "PUT" : "POST"}
            />

            {/* AlertDialog */}
            <ConfirmDeleteDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                title="Confirmer la suppression"
                message={deleteCustomer
                    ? `Voulez-vous vraiment supprimer ${deleteCustomer.name} ? Cette action est irréversible.`
                    : `Voulez-vous vraiment supprimer ${Object.keys(rowSelection).length} client(s) ? Cette action est irréversible.`}
                onConfirm={() => {
                    const ids = deleteCustomer ? [deleteCustomer.id]
                        : Object.keys(rowSelection).map(k => {
                            const row = table.getRowModel().rows[Number(k)];
                            return row.original.id;
                        });

                    if (ids.length === 0) return;

                    router.post(
                        route('customers.destroy'), { ids },
                        {
                            preserveState: true,
                            onSuccess: () => {
                                toast.success(
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-foreground">Succès</span>
                                        <span className="text-sm text-muted-foreground">
                                            Les clients sélectionnés ont été supprimés.
                                        </span>
                                    </div>
                                );
                            },
                            onError: (errors) => {
                                toast.error(
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-foreground">Erreur</span>
                                        <span className="text-sm text-muted-foreground">
                                            {errors.message ?? "Une erreur est survenue lors de la suppression."}
                                        </span>
                                    </div>
                                );
                            },
                        }
                    );
                    setRowSelection({});
                    setDeleteCustomer(null);
                    setIsDialogOpen(false);
                }}
            />
        </AppLayout>
    );
}

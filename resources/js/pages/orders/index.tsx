import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Order, PaginationMeta } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { ColumnDef, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ArrowUpDown, Edit, MoreHorizontal, Trash2, Plus, Download, Search, Eye, File, FileText } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { currencyFormatter, dateTimeFormatOptions } from '@/lib/utils';
import ConfirmDeleteDialog from '@/components/confirm-delete-dialog';
import DataTablePagination from '@/components/datatable-pagination';
import DataTable from '@/components/datatable';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tableau de bord', href: route('dashboard') },
    { title: 'Ventes', href: '#' },
]

interface PageProps {
    orders: {
        data: Order[];
        meta: PaginationMeta;
    };
    filters: {
        search?: string;
        sort?: string;
        per_page?: number;
    }
}

export default function Index({ orders, filters }: PageProps) {
    const isMobile = useIsMobile();

    const [search, setSearch] = useState(filters.search ?? "");
    const [sort, setSort] = useState("");
    const [perPage, setPerPage] = useState<number>(filters.per_page ?? 10);
    const [deleteOrder, setDeleteOrder] = useState<Order | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

    const toggleSort = (column: keyof Order) => {
        let dir: "asc" | "desc" | "" = "asc"
        if (sort === column) dir = "desc"
        else if (sort === "-" + column) dir = ""
        const newSort = dir === "" ? "" : dir === "desc" ? "-" + column : String(column)
        setSort(newSort);
        applyFilters({ sort: newSort })
    }

    const applyFilters = (newFilters: Partial<PageProps["filters"]> & { page?: number }) => {
        router.get(route('orders.index'), {
            search,
            sort,
            per_page: perPage,
            page: orders.meta.current_page,
            ...newFilters,
        }, { preserveState: true, replace: true });
    }

    const handleDelete = (order: Order) => {
        setDeleteOrder(order);
        setIsDialogOpen(true);
    };

    const handleBulkDelete = () => {
        if (Object.keys(rowSelection).length > 0) {
            setDeleteOrder(null);
            setIsDialogOpen(true);
        }
    };

    const handleExport = () => {
        const headers = ["Date de création"];
        const rows = orders.data.map(u => [
            u.created_at
        ]);
        const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "orders_export.csv");
        link.click();
    };

    const columns = useMemo<ColumnDef<Order>[]>(() => [
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
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "reference",
            header: () => 'Référence',
            cell: ({ row }) => {
                return row.original.reference;
            },
        },
        {
            accessorKey: "customer.name",
            header: () => 'Client',
            cell: ({ row }) => {
                if (row.original.customer) {
                    return row.original.customer.name;
                } else {
                    return <span className="italic text-muted-foreground">Aucun client</span>
                }
            },
        },
        {
            accessorKey: "amount",
            header: 'Total',
            cell: ({ row }) => {
                return currencyFormatter(Number(row.original.amount));
            },
        },
        {
            accessorKey: "products_count",
            header: 'Produits',
            cell: ({ row }) => row.original.products_count,
        },
        {
            id: "facture",
            header: 'Facture',
            cell: ({ row }) => {
                return <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(route('orders.print', row.original.id), '_blank')}
                >
                    <FileText className="w-4 h-4"/>
                </Button>
            },
        },
        {
            accessorKey: "date",
            header: 'Commandé le',
            cell: ({ row }) => {
                const date = new Date(row.original.date);
                return date.toLocaleString("fr-FR", dateTimeFormatOptions);
            }
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
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.visit(route('orders.show', row.original.id))}>
                            <Eye className="mr-1 h-4 w-4" /> Voir
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.visit(route('orders.edit', row.original.id))}>
                            <Edit className="mr-1 h-4 w-4" /> Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTimeout(() => handleDelete(row.original), 100)}>
                            <Trash2 className="mr-1 h-4 w-4" /> Supprimer
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        }
    ], [sort]);

    const table = useReactTable({
        data: orders.data,
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
            <Head title="Commandes" />
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex justify-end flex-wrap gap-y-2">
                        <Button
                            variant="outline"
                            className="ml-2"
                            onClick={handleExport}
                        >
                            <Download className="h-4 w-4" /> Exporter les ventes
                        </Button>
                        <Button
                            className="ml-2"
                            onClick={() => router.visit(route('orders.create'))}
                        >
                            <Plus className="h-4 w-4" /> Ajouter une vente
                        </Button>
                    </div>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Ventes</h1>
                            <p className="text-sm text-muted-foreground">Gérez les ventes et les clients.</p>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <div className='relative'>
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={isMobile ? "Rechercher..." : "Rechercher une vente..."}
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
                    <DataTable<Order>
                        data={orders.data}
                        columns={columns}
                        rowSelection={rowSelection}
                        onRowSelectionChange={handleRowSelectionChange}
                        emptyMessage="Aucun commande trouvé."
                    />

                    {/* Pagination */}
                    <DataTablePagination
                        meta={orders.meta}
                        perPage={perPage}
                        onPageChange={(page) => applyFilters({ page })}
                        onPerPageChange={(val) => {
                            setPerPage(val);
                            applyFilters({ per_page: val, page: 1 });
                        }}
                    />
                </div>
            </div>
            {/* AlertDialog */}
            <ConfirmDeleteDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                title="Confirmer la suppression"
                message={deleteOrder
                    ? `Voulez-vous vraiment supprimer cette commande ? Cette action est irréversible.`
                    : `Voulez-vous vraiment supprimer ${Object.keys(rowSelection).length} commande(s) ? Cette action est irréversible.`}
                onConfirm={() => {
                    const ids = deleteOrder ? [deleteOrder.id]
                        : Object.keys(rowSelection).map(k => {
                            const row = table.getRowModel().rows[Number(k)];
                            return row.original.id;
                        });

                    if (ids.length === 0) return;

                    router.post(
                        route('orders.destroy'),
                        { ids },
                        {
                            preserveState: true,
                            onSuccess: () => {
                                toast.success(
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-foreground">Succès</span>
                                        <span className="text-sm text-muted-foreground">
                                            Les commandes sélectionnées ont été supprimées.
                                        </span>
                                    </div>
                                );
                            },
                            onError: (errors: any) => {
                                const messages: string[] = [];

                                // Check if errors.errors exists and is an object
                                if (errors.errors && typeof errors.errors === 'object') {
                                    for (const key of Object.keys(errors.errors)) {
                                        const fieldErrors = errors.errors[key];
                                        if (Array.isArray(fieldErrors)) {
                                            messages.push(...fieldErrors);
                                        }
                                    }
                                } else if (errors.error) {
                                    messages.push(errors.error);
                                } else {
                                    messages.push("Une erreur est survenue lors de la suppression.");
                                }

                                toast.error(
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-foreground">Erreur</span>
                                        <ul className="text-sm text-muted-foreground list-disc list-inside mt-1">
                                            {messages.map((msg, index) => (
                                                <li key={index}>{msg}</li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            },
                        }
                    );
                    setRowSelection({});
                    setDeleteOrder(null);
                    setIsDialogOpen(false);
                }}
            />
        </AppLayout>
    );
}

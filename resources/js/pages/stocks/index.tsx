import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, PaginationMeta, Stock, Supplier, Product } from '@/types';
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
import ProductsLayout from '@/layouts/products/layout';
import { dateTimeFormatOptions, plural } from '@/lib/utils';
import { RowActions } from '@/components/row-actions';
import StockForm from './form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tableau de bord', href: route('dashboard') },
    { title: 'Stocks', href: '#' },
];

interface PageProps {
    stocks: {
        data: Stock[];
        meta: PaginationMeta;
    };
    filters: {
        search?: string;
        sort?: string;
        per_page?: number;
    },
    products: Product[];
    suppliers: Supplier[];
}

export default function Index({ stocks, products, suppliers, filters }: PageProps) {
    const isMobile = useIsMobile();

    const [search, setSearch] = useState(filters.search ?? "");
    const [sort, setSort] = useState("");
    const [perPage, setPerPage] = useState<number>(filters.per_page ?? 10);
    const [deleteStock, setDeleteStock] = useState<Stock | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

    const [creatingStock, setCreatingStock] = useState(false);
    const [editingStock, setEditingStock] = useState<Stock | null>(null);

    const toggleSort = (column: keyof Stock) => {
        let dir: "asc" | "desc" | "" = "asc";
        if (sort === column) dir = "desc";
        else if (sort === "-" + column) dir = "";
        const newSort = dir === "" ? "" : dir === "desc" ? "-" + column : String(column);
        setSort(newSort);
        applyFilters({ sort: newSort });
    }

    const applyFilters = (newFilters: Partial<PageProps["filters"]> & { page?: number }) => {
        router.get(route('stocks.index'), {
            search,
            sort,
            per_page: perPage,
            page: stocks.meta.current_page,
            ...newFilters,
        }, { preserveState: true, replace: true, except: ['products', 'suppliers'] });
    }

    const handleEdit = (stock: Stock) => setEditingStock(stock);

    const handleDelete = (stock: Stock) => {
        setDeleteStock(stock);
        setIsDialogOpen(true);
    };

    const handleBulkDelete = () => {
        if (Object.keys(rowSelection).length > 0) {
            setDeleteStock(null);
            setIsDialogOpen(true);
        }
    };

    const columns = useMemo<ColumnDef<Stock>[]>(() => [
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
            accessorKey: "quantity_in_stock",
            header: () => 'Quantité',
            cell: ({ row }) => {
                const stock = row.original;

                return plural(stock.quantity_in_stock, stock.product.unity.name);
            }
        },
        {
            accessorKey: "product.name",
            header: () => 'Produit',
            cell: ({ row }) => {
                const stock = row.original;

                if (stock.product) {
                    return stock.product.name;
                } else {
                    return <span className="text-sm text-muted-foreground">Produit supprimé</span>;
                }
            }
        },
        {
            accessorKey: "supplier.name",
            header: () => 'Fournisseur',
            cell: ({ row }) => {
                const stock = row.original;

                if (stock.supplier) {
                    return stock.supplier.name;
                } else {
                    return <span className="text-sm text-muted-foreground">Fournisseur supprimé</span>;
                }
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
                <RowActions row={row.original} onEdit={handleEdit} onDelete={handleDelete} />
            ),
        }
    ], [sort]);

    const table = useReactTable({
        data: stocks.data,
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
            <Head title="Catégorie de produits" />
            <ProductsLayout>
                <div className="space-y-6 md:mt-[-77px]">
                    {/* Header */}
                    <div className="flex justify-end flex-wrap">
                        <Button
                            className="ml-2"
                            onClick={() => setCreatingStock(true)}
                        >
                            <Plus className="h-4 w-4" /> Ajouter un stock
                        </Button>
                    </div>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Stocks</h1>
                            <p className="text-sm text-muted-foreground">Gérez les stocks de produits.</p>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <div className='relative'>
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={isMobile ? "Rechercher..." : "Rechercher un stock..."}
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
                    <DataTable<Stock>
                        data={stocks.data}
                        columns={columns}
                        rowSelection={rowSelection}
                        onRowSelectionChange={handleRowSelectionChange}
                        emptyMessage="Aucun stock trouvé."
                    />

                    {/* Pagination */}
                    <DataTablePagination
                        meta={stocks.meta}
                        perPage={perPage}
                        onPageChange={(page) => applyFilters({ page })}
                        onPerPageChange={(val) => {
                            setPerPage(val);
                            applyFilters({ per_page: val, page: 1 });
                        }}
                    />
                </div>
                <StockForm
                    open={creatingStock || !!editingStock}
                    onClose={() => {
                        setCreatingStock(false);
                        setEditingStock(null);
                    }}
                    stock={editingStock}
                    submitUrl={
                        editingStock
                            ? route('stocks.update', editingStock.id)
                            : route('stocks.store')
                    }
                    method={editingStock ? "PUT" : "POST"}
                    products={products}
                    suppliers={suppliers}
                />

                {/* AlertDialog */}
                <ConfirmDeleteDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    title="Confirmer la suppression"
                    message={deleteStock
                        ? `Voulez-vous vraiment supprimer ce stock ? Cette action est irréversible.`
                        : `Voulez-vous vraiment supprimer ${Object.keys(rowSelection).length} stock(s) ? Cette action est irréversible.`}
                    onConfirm={() => {
                        const ids = deleteStock ? [deleteStock.id]
                            : Object.keys(rowSelection).map(k => {
                                const row = table.getRowModel().rows[Number(k)];
                                return row.original.id;
                            });

                        if (ids.length === 0) return;

                        router.post(
                            route('stocks.destroy'), { ids },
                            {
                                preserveState: true,
                                onSuccess: () => {
                                    toast.success(
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-foreground">Succès</span>
                                            <span className="text-sm text-muted-foreground">
                                                Les stocks sélectionnées ont été supprimées.
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
                        setDeleteStock(null);
                        setIsDialogOpen(false);
                    }}
                />
            </ProductsLayout>
        </AppLayout>
    );
}

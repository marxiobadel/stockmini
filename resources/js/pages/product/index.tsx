import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Category, PaginationMeta, Product, Unity } from '@/types';
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
import { currencyFormatter, dateTimeFormatOptions, plural } from '@/lib/utils';
import { RowActions } from '@/components/row-actions';
import ProductForm from './form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tableau de bord', href: route('dashboard') },
    { title: "Produits", href: '#' },
];

interface PageProps {
    products: {
        data: Product[];
        meta: PaginationMeta;
    };
    filters: {
        search?: string;
        sort?: string;
        per_page?: number;
    },
    categories: Category[];
    unities: Unity[];
}

export default function Index({ products, categories, unities, filters }: PageProps) {
    const isMobile = useIsMobile();

    const [search, setSearch] = useState(filters.search ?? "");
    const [sort, setSort] = useState("");
    const [perPage, setPerPage] = useState<number>(filters.per_page ?? 10);
    const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

    const [creatingProduct, setCreatingProduct] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const toggleSort = (column: keyof Product) => {
        let dir: "asc" | "desc" | "" = "asc";
        if (sort === column) dir = "desc";
        else if (sort === "-" + column) dir = "";
        const newSort = dir === "" ? "" : dir === "desc" ? "-" + column : String(column);
        setSort(newSort);
        applyFilters({ sort: newSort });
    }

    const applyFilters = (newFilters: Partial<PageProps["filters"]> & { page?: number }) => {
        router.get(route('products.index'), {
            search,
            sort,
            per_page: perPage,
            page: products.meta.current_page,
            ...newFilters,
        }, { preserveState: true, except: ['categories', 'unities'], replace: true });
    }

    const handleEdit = (product: Product) => setEditingProduct(product);
    const handleShow = (product: Product) => setEditingProduct(product);

    const handleDelete = (product: Product) => {
        setDeleteProduct(product);
        setIsDialogOpen(true);
    };

    const handleBulkDelete = () => {
        if (Object.keys(rowSelection).length > 0) {
            setDeleteProduct(null);
            setIsDialogOpen(true);
        }
    };

    const columns = useMemo<ColumnDef<Product>[]>(() => [
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
            accessorKey: "category.name",
            header: 'Catégorie',
            cell: ({ row }) => row.original.category?.name || "N/A",
        },
        {
            accessorKey: "selling_price",
            header: 'Prix de vente',
            cell: ({ row }) => currencyFormatter(row.original.selling_price)
        },
        {
            accessorKey: "purchasing_price",
            header: 'Prix d\'achat',
            cell: ({ row }) => {
                const value = row.original.purchasing_price;
                return value ? currencyFormatter(value) : <span className="italic text-muted-foreground">Aucun prix d'achat défini</span>
            }
        },
        {
            accessorKey: "quantity",
            header: 'Quantité Initiale',
            cell: ({ row }) => {
                return plural(row.original.quantity, row.original.unity?.name || "unité")
            }
        },
        {
            accessorKey: "quantity_in_stock",
            header: 'Quantité en Stock',
            cell: ({ row }) => {
                const quantity = row.original.quantity_in_stock;
                const threshold = row.original.threshold_alert;

                const isBelowThreshold = quantity <= threshold;

                return (
                    <span className={isBelowThreshold ? 'text-red-600 font-semibold' : ''}>
                        {plural(quantity, row.original.unity?.name || "unité")}
                    </span>
                );
            }
        },
        {
            accessorKey: "threshold_alert",
            header: 'Seuil d\'alerte',
            cell: ({ row }) => {
                return plural(row.original.threshold_alert, row.original.unity?.name || "unité")
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
                <RowActions
                    row={row.original}
                    onShow={handleShow}
                    onEdit={handleEdit}
                    showRoute={route('products.show', row.original.id)}
                    onDelete={handleDelete} />
            ),
        }
    ], [sort]);

    const table = useReactTable({
        data: products.data,
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
                            onClick={() => setCreatingProduct(true)}
                        >
                            <Plus className="h-4 w-4" /> Ajouter un produit
                        </Button>
                    </div>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Produits</h1>
                            <p className="text-sm text-muted-foreground">Gérez les produits.</p>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <div className='relative'>
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={isMobile ? "Rechercher..." : "Rechercher un produit..."}
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
                    <DataTable<Product>
                        data={products.data}
                        columns={columns}
                        rowSelection={rowSelection}
                        onRowSelectionChange={handleRowSelectionChange}
                        emptyMessage="Aucun produit trouvé."
                    />

                    {/* Pagination */}
                    <DataTablePagination
                        meta={products.meta}
                        perPage={perPage}
                        onPageChange={(page) => applyFilters({ page })}
                        onPerPageChange={(val) => {
                            setPerPage(val);
                            applyFilters({ per_page: val, page: 1 });
                        }}
                    />
                </div>
                <ProductForm
                    open={creatingProduct || !!editingProduct}
                    onClose={() => {
                        setCreatingProduct(false);
                        setEditingProduct(null);
                    }}
                    product={editingProduct}
                    submitUrl={
                        editingProduct
                            ? route('products.update', editingProduct.id)
                            : route('products.store')
                    }
                    method={editingProduct ? "PUT" : "POST"}
                    categories={categories}
                    unities={unities}
                />

                {/* AlertDialog */}
                <ConfirmDeleteDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    title="Confirmer la suppression"
                    message={deleteProduct
                        ? `Voulez-vous vraiment supprimer ${deleteProduct.name} ? Cette action est irréversible.`
                        : `Voulez-vous vraiment supprimer ${Object.keys(rowSelection).length} produit(s) ? Cette action est irréversible.`}
                    onConfirm={() => {
                        const ids = deleteProduct ? [deleteProduct.id]
                            : Object.keys(rowSelection).map(k => {
                                const row = table.getRowModel().rows[Number(k)];
                                return row.original.id;
                            });

                        if (ids.length === 0) return;

                        router.post(
                            route('products.destroy'), { ids },
                            {
                                preserveState: true,
                                onSuccess: () => {
                                    toast.success(
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-foreground">Succès</span>
                                            <span className="text-sm text-muted-foreground">
                                                Les produits sélectionnés ont été supprimés.
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
                        setDeleteProduct(null);
                        setIsDialogOpen(false);
                    }}
                />
            </ProductsLayout>
        </AppLayout>
    );
}

"use client"

import AppLayout from '@/layouts/app-layout';
import { type Product, type BreadcrumbItem, Category, Unity } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { type SortingState, useReactTable, getCoreRowModel, getPaginationRowModel, createColumnHelper, ColumnDef } from '@tanstack/react-table';
import { toast } from "sonner";
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Trash2, Eye } from 'lucide-react'
import React, { useEffect } from 'react'
import { useForm } from '@inertiajs/react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { currencyFormatter, plural } from '@/lib/utils';
import ProductTable from './table';
import ProductDialog from './modal';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tableau de bord', href: route('dashboard') },
    { title: 'Produit', href: route('products.index') },
]

interface PageProps {
    products: {
        data: Product[];
        links: any[];
        meta: { current_page: number; last_page: number; total: number; per_page: number };
    };
    categories: Category[];
    unities: Unity[];
}

const columnHelper = createColumnHelper<Product>()

export default function Index({ products, categories, unities }: PageProps) {
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [sorting, setSorting] = React.useState<SortingState>([]);

    const [search, setSearch] = React.useState("");

    // Pour modifier / ajouter via la même modale
    const [isEditMode, setIsEditMode] = React.useState(false)
    const [currentProductId, setCurrentProductId] = React.useState<number | null>(null)

    // Pour confirmation suppression
    const [alertDialogOpen, setAlertDialogOpen] = React.useState(false)
    const [productToDelete, setProductToDelete] = React.useState<Product | null>(null)

    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        description: '',
        selling_price: '',
        purchasing_price: '',
        threshold_alert: '',
        category_id: '',
        unity_id: ''
    });

    const handleAddOrEditProduct = () => {
        if (isEditMode && currentProductId) {
            put(route('products.update', currentProductId), {
                onSuccess: () => {
                    setDialogOpen(false);
                    reset();
                    setIsEditMode(false);
                    setCurrentProductId(null);
                    toast('Produit modifié', {
                        description: 'Le produit a été mise à jour avec succès.',
                        duration: 4000,
                    })
                },
            })
        } else {
            post(route('products.store'), {
                onSuccess: () => {
                    setDialogOpen(false);
                    reset();
                    toast('Produit ajouté', {
                        description: 'Le produit a été enregistré avec succès.',
                        duration: 4000,
                    })
                },
            })
        }
    }

    const columns: ColumnDef<Product, any>[] = [
        columnHelper.accessor('id', {
            header: 'ID',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('name', {
            header: ({ column }) => (
                <div
                    onClick={() => column.toggleSorting()}
                    className="cursor-pointer select-none flex items-center gap-1"
                >
                    Nom
                    {column.getIsSorted() === 'asc' && <span>↑</span>}
                    {column.getIsSorted() === 'desc' && <span>↓</span>}
                </div>
            ),
            cell: info => info.getValue(),
            enableSorting: true,
        }),
        columnHelper.accessor('selling_price', {
            header: 'Prix de vente',
            cell: info => currencyFormatter(info.getValue())
        }),
        columnHelper.accessor('purchasing_price', {
            header: "Prix d'achat",
            cell: info => {
                const value = info.getValue()
                return value ? currencyFormatter(value) : <span className="italic text-muted-foreground">Aucun prix d'achat défini</span>
            },
        }),
        columnHelper.accessor('category.name', {
            header: 'Catégorie',
            cell: info => info.getValue()
        }),
        columnHelper.accessor('quantity', {
            header: "Quantité",
            cell: info => {
                const product = info.row.original;

                return plural(product.quantity, product.unity.name);
            }
        }),
        columnHelper.accessor('quantity_in_stock', {
            header: 'Quantité en stock',
            cell: info => {
                const product = info.row.original;
                const quantity = product.quantity_in_stock;
                const threshold = product.threshold_alert;

                const isBelowThreshold = quantity <= threshold;

                return (
                    <span className={isBelowThreshold ? 'text-red-600 font-semibold' : ''}>
                        {plural(quantity, product.unity.name)}
                    </span>
                );
            }
        }),
        columnHelper.accessor('threshold_alert', {
            header: "Stock d'alerte",
            cell: info => {
                const product = info.row.original;

                return plural(product.threshold_alert, product.unity.name);
            }
        }),
        columnHelper.accessor('created_at', {
            header: 'Créé le',
            cell: info => new Date(info.getValue()).toLocaleDateString('fr-FR'),
        }),
        {
            header: 'Actions',
            id: 'actions',
            cell: ({ row }) => (
                <>
                    <div className="flex gap-2">
                        <Link href={route('products.show', { product: row.original.id })}>
                            <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4" />
                            </Button>
                        </Link>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                setData({
                                    name: row.original.name,
                                    description: row.original.description || '',
                                    selling_price: String(row.original.selling_price),
                                    purchasing_price: row.original.purchasing_price ? String(row.original.purchasing_price) : '',
                                    threshold_alert: String(row.original.threshold_alert),
                                    category_id: String(row.original.category_id),
                                    unity_id: String(row.original.unity_id)
                                });
                                setIsEditMode(true);
                                setCurrentProductId(row.original.id);
                                setDialogOpen(true);
                            }}
                        >
                            <Pencil className="w-4 h-4" />
                        </Button>

                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                                setProductToDelete(row.original)
                                setAlertDialogOpen(true)
                            }}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* AlertDialog pour confirmation suppression */}
                    <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Êtes-vous sûr·e de vouloir supprimer le produit &quot;{productToDelete?.name}&quot; ? Cette action est irréversible.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => {
                                        if (productToDelete) {
                                            router.delete(route('products.destroy', productToDelete.id))
                                            setAlertDialogOpen(false)
                                        }
                                    }}
                                >
                                    Supprimer
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </>
            ),
        },
    ]

    const table = useReactTable({
        data: products.data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        state: { sorting },
        onSortingChange: setSorting,
    });

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.visit(route('products.index'), {
                method: "get",
                data: { search, page: 1 },
                preserveState: true,
            })
        }, 500)

        return () => clearTimeout(timeout)
    }, [search])

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Liste des fournisseurs" />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Liste des produits</h1>

                    <div className="flex gap-2 items-center">
                        <Input
                            placeholder="Rechercher..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-64"
                        />

                        <ProductDialog
                            open={dialogOpen}
                            setOpen={setDialogOpen}
                            isEditMode={isEditMode}
                            data={data}
                            setData={setData}
                            errors={errors}
                            categories={categories}
                            unities={unities}
                            processing={processing}
                            handleSubmit={handleAddOrEditProduct}
                            reset={() => {
                                reset()
                                setIsEditMode(false)
                                setCurrentProductId(null)
                            }}
                        />
                    </div>
                </div>

                <ProductTable table={table} products={products} />
            </div>
        </AppLayout>
    )
}

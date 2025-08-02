"use client"

import AppLayout from '@/layouts/app-layout';
import { type Product, type BreadcrumbItem, Category, Unity } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, flexRender, createColumnHelper, ColumnDef } from '@tanstack/react-table';
import type { SortingState } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { toast } from "sonner";
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Trash2, Plus, Loader2Icon, FileWarning } from 'lucide-react'
import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useForm } from '@inertiajs/react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { currencyFormatter, plural } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tableau de bord', href: route('dashboard') },
    { title: 'Produit', href: route('products.index') },
]

interface PageProps {
    products: Product[];
    categories: Category[];
    unities: Unity[];
}

const columnHelper = createColumnHelper<Product>()

export default function Index({ products, categories, unities }: PageProps) {
    const [globalFilter, setGlobalFilter] = React.useState('')
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [sorting, setSorting] = React.useState<SortingState>([])

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

    const filteredData = React.useMemo(() => {
        return products.filter(s =>
            s.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
            s.description?.toLowerCase().includes(globalFilter.toLowerCase())
        )
    }, [products, globalFilter])

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
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        },
        onSortingChange: setSorting,
    })

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Liste des fournisseurs" />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Liste des produits</h1>

                    <div className="flex gap-2 items-center">
                        <Input
                            placeholder="Rechercher..."
                            value={globalFilter}
                            onChange={e => setGlobalFilter(e.target.value)}
                            className="w-64"
                        />

                        <Dialog open={dialogOpen} onOpenChange={(open) => {
                            setDialogOpen(open);
                            if (!open) {
                                reset();
                                setIsEditMode(false);
                                setCurrentProductId(null);
                            }
                        }}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Ajouter
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{isEditMode ? 'Modifier le produit' : 'Ajouter un produit'}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-6">
                                    <div className="space-y-1">
                                        <Label htmlFor="name">Nom <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            placeholder="Ex: Riz bijou 50 kg ..."
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                                                <FileWarning className="w-4 h-4" />
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={e => setData('description', e.target.value)}
                                            placeholder="Brève description du produit"
                                            rows={4}
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                                                <FileWarning className="w-4 h-4" />
                                                {errors.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1 space-y-1">
                                            <Label htmlFor="selling_price">Prix de vente <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="selling_price"
                                                type='number'
                                                value={data.selling_price}
                                                onChange={e => setData('selling_price', e.target.value)}
                                            />
                                            {errors.selling_price && (
                                                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                                                    <FileWarning className="w-4 h-4" />
                                                    {errors.selling_price}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex-1 space-y-1">
                                            <Label htmlFor="purchasing_price">Prix d'achat</Label>
                                            <Input
                                                id="purchasing_price"
                                                type='number'
                                                value={data.purchasing_price}
                                                onChange={e => setData('purchasing_price', e.target.value)}
                                            />
                                            {errors.purchasing_price && (
                                                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                                                    <FileWarning className="w-4 h-4" />
                                                    {errors.purchasing_price}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <Label htmlFor="threshold_alert">Stock d'alerte <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="threshold_alert"
                                                type='number'
                                                value={data.threshold_alert}
                                                onChange={e => setData('threshold_alert', e.target.value)}
                                            />
                                            {errors.threshold_alert && (
                                                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                                                    <FileWarning className="w-4 h-4" />
                                                    {errors.threshold_alert}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1 space-y-1">
                                            <Label htmlFor="category_id">Catégorie <span className="text-red-500">*</span></Label>
                                            <Select
                                                value={data.category_id}
                                                onValueChange={(value) => setData('category_id', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Choisissez une catégorie" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map(category => (
                                                        <SelectItem key={category.id} value={String(category.id)}>
                                                            {category.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.category_id && (
                                                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                                                    <FileWarning className="w-4 h-4" />
                                                    {errors.category_id}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <Label htmlFor="unity_id">Unité <span className="text-red-500">*</span></Label>
                                            <Select
                                                value={data.unity_id}
                                                onValueChange={(value) => setData('unity_id', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Choisissez une unité" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {unities.map(unity => (
                                                        <SelectItem key={unity.id} value={String(unity.id)}>
                                                            {unity.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.unity_id && (
                                                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                                                    <FileWarning className="w-4 h-4" />
                                                    {errors.unity_id}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button onClick={handleAddOrEditProduct} disabled={processing}>
                                            {processing && <Loader2Icon className="animate-spin" />}
                                            {processing ? 'Enregistrement...' : 'Enregistrer'}
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="border rounded-md overflow-x-auto">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map(headerGroup => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <TableHead key={header.id}>
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>

                        <TableBody>
                            {table.getRowModel().rows.length > 0 ? (
                                table.getRowModel().rows.map(row => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map(cell => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={table.getAllColumns().length} className="text-center italic text-muted-foreground py-6">
                                        Aucun produit trouvé.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-between mt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!table.getCanPreviousPage()}
                        onClick={() => table.previousPage()}
                    >
                        Précédent
                    </Button>
                    {table.getRowModel().rows.length > 0 &&
                        <span className="text-sm">
                            Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
                        </span>}
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!table.getCanNextPage()}
                        onClick={() => table.nextPage()}
                    >
                        Suivant
                    </Button>
                </div>
            </div>
        </AppLayout>
    )
}

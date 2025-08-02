"use client"

import AppLayout from '@/layouts/app-layout';
import { type Product, type BreadcrumbItem, Supplier, Stock } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
    createColumnHelper,
    ColumnDef,
} from '@tanstack/react-table';
import type { Row, SortingState } from '@tanstack/react-table'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select'
import { toast } from "sonner";
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Trash2, Plus, Loader2Icon, BatteryWarning, FileWarning } from 'lucide-react'
import React from 'react'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useForm } from '@inertiajs/react'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { plural } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tableau de bord', href: route('dashboard') },
    { title: 'Produit', href: route('products.index') },
]

interface PageProps {
    suppliers: Supplier[];
    products: Product[];
    stocks: Stock[];
}

const columnHelper = createColumnHelper<Stock>()

export default function Index({ products, suppliers, stocks }: PageProps) {
    const [globalFilter, setGlobalFilter] = React.useState('')
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [sorting, setSorting] = React.useState<SortingState>([])

    const [isEditMode, setIsEditMode] = React.useState(false)
    const [currentStockId, setCurrentStockId] = React.useState<number | null>(null)

    const [alertDialogOpen, setAlertDialogOpen] = React.useState(false)
    const [stockToDelete, setStockToDelete] = React.useState<Stock | null>(null)

    const { data, setData, post, put, processing, reset, errors } = useForm({
        quantity_in_stock: '',
        product_id: '',
        supplier_id: ''
    });

    const handleAddOrEditStock = () => {
        if (isEditMode && currentStockId) {
            put(route('stocks.update', currentStockId), {
                onSuccess: () => {
                    setDialogOpen(false);
                    reset();
                    setIsEditMode(false);
                    setCurrentStockId(null);
                    toast('Stock modifié', {
                        description: 'Le stock a été mis à jour avec succès.',
                        duration: 4000,
                    })
                },
            })
        } else {
            post(route('stocks.store'), {
                onSuccess: () => {
                    setDialogOpen(false);
                    reset();
                    toast('Stock ajouté', {
                        description: 'Le stock a été enregistré avec succès.',
                        duration: 4000,
                    })
                },
            })
        }
    }

    // Fonction de filtrage global : filtre uniquement sur product.name et supplier.name
    function customGlobalFilter(row: Row<Stock>, columnId: string, filterValue: string): boolean {
        const search = filterValue.toLowerCase();
        return (
            row.original.product?.name.toLowerCase().includes(search) ||
            row.original.supplier?.name.toLowerCase().includes(search)
        );
    }

    const columns: ColumnDef<Stock, any>[] = [
        columnHelper.accessor('id', {
            header: 'ID',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('quantity_in_stock', {
            header: 'Quantité',
            cell: info => {
                const stock = info.row.original;

                return plural(stock.quantity_in_stock, stock.product.unity.name);
            }
        }),
        columnHelper.accessor('product.name', {
            header: "Produit",
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('supplier.name', {
            header: 'Fournisseur',
            cell: info => info.getValue()
        }),
        columnHelper.accessor('created_at', {
            header: 'Créé le',
            cell: info => new Date(info.getValue()).toLocaleDateString('fr-FR'),
        }),
        columnHelper.accessor('updated_at', {
            header: 'Modifié le',
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
                                    quantity_in_stock: String(row.original.quantity_in_stock),
                                    supplier_id: String(row.original.supplier.id),
                                    product_id: String(row.original.product.id)
                                });
                                setIsEditMode(true);
                                setCurrentStockId(row.original.id);
                                setDialogOpen(true);
                            }}
                        >
                            <Pencil className="w-4 h-4" />
                        </Button>

                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                                setStockToDelete(row.original)
                                setAlertDialogOpen(true)
                            }}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>

                    <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Êtes-vous sûr·e de vouloir supprimer le stock ? Cette action est irréversible.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => {
                                        if (stockToDelete) {
                                            router.delete(route('stocks.destroy', stockToDelete.id))
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
        data: stocks,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn: customGlobalFilter,
        state: {
            sorting,
            globalFilter,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
    })

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Liste des stocks" />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Ravitaillement</h1>

                    <div className="flex gap-2 items-center">
                        <Input
                            placeholder="Rechercher (produit ou fournisseur)..."
                            value={globalFilter}
                            onChange={e => setGlobalFilter(e.target.value)}
                            className="w-64"
                        />

                        <Dialog open={dialogOpen} onOpenChange={(open) => {
                            setDialogOpen(open);
                            if (!open) {
                                reset();
                                setIsEditMode(false);
                                setCurrentStockId(null);
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
                                    <DialogTitle>{isEditMode ? 'Modifier le stock' : 'Ajouter un stock'}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-6">
                                    <div className="space-y-1">
                                        <Label htmlFor="quantity_in_stock">Quantité <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="quantity_in_stock"
                                            value={data.quantity_in_stock}
                                            onChange={e => setData('quantity_in_stock', e.target.value)}
                                        />
                                        {errors.quantity_in_stock && (
                                            <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                                                <FileWarning className="w-4 h-4" />
                                                {errors.quantity_in_stock}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <Label htmlFor="product_id">Produit <span className="text-red-500">*</span></Label>
                                        <Select
                                            value={data.product_id}
                                            onValueChange={(value) => setData('product_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choisissez un produit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {products.map(product => (
                                                    <SelectItem key={product.id} value={String(product.id)}>
                                                        {product.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.product_id && (
                                            <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                                                <FileWarning className="w-4 h-4" />
                                                {errors.product_id}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <Label htmlFor="supplier_id">Fournisseur <span className="text-red-500">*</span></Label>
                                        <Select
                                            value={data.supplier_id}
                                            onValueChange={(value) => setData('supplier_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choisissez un fournisseur" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {suppliers.map(supplier => (
                                                    <SelectItem key={supplier.id} value={String(supplier.id)}>
                                                        {supplier.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.supplier_id && (
                                            <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                                                <FileWarning className="w-4 h-4" />
                                                {errors.supplier_id}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button onClick={handleAddOrEditStock} disabled={processing}>
                                        {processing && <Loader2Icon className="animate-spin" />}
                                        {processing ? 'Enregistrement...' : 'Enregistrer'}
                                    </Button>
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
                                        Aucun stock trouvé.
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

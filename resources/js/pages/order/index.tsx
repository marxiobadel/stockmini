"use client"

import AppLayout from '@/layouts/app-layout';
import { type Product, type BreadcrumbItem, Order } from '@/types';
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
import { toast } from "sonner";
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Trash2, Plus, Loader2Icon, FileWarning } from 'lucide-react'
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tableau de bord', href: route('dashboard') },
    { title: 'Produit', href: route('products.index') },
]

interface PageProps {
    orders: Order[];
    products: Product[];
}

const columnHelper = createColumnHelper<Order>()

export default function Index({ products, orders }: PageProps) {
    const [globalFilter, setGlobalFilter] = React.useState('')
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [sorting, setSorting] = React.useState<SortingState>([])

    const [isEditMode, setIsEditMode] = React.useState(false)
    const [currentOrderId, setCurrentOrderId] = React.useState<number | null>(null)

    const [alertDialogOpen, setAlertDialogOpen] = React.useState(false)
    const [orderToDelete, setOrderToDelete] = React.useState<Order | null>(null)

    const { data, setData, post, put, processing, reset, errors } = useForm<{
        product_ids: number[];
    }>({
        product_ids: [],
    });

    const handleAddOrEditOrder = () => {
        if (isEditMode && currentOrderId) {
            put(route('orders.update', currentOrderId), {
                onSuccess: () => {
                    setDialogOpen(false);
                    reset();
                    setIsEditMode(false);
                    setCurrentOrderId(null);
                    toast('Vente modifiée', {
                        description: 'La vente a été mise à jour avec succès.',
                        duration: 4000,
                    })
                },
            })
        } else {
            post(route('orders.store'), {
                onSuccess: () => {
                    setDialogOpen(false);
                    reset();
                    toast('Vente ajoutée', {
                        description: 'La vente a été enregistrée avec succès.',
                        duration: 4000,
                    })
                },
            })
        }
    }

    function customGlobalFilter(row: Row<Order>, columnId: string, filterValue: string): boolean {
        const search = filterValue.toLowerCase();
        return (
            row.original.reference.toLowerCase().includes(search)
        );
    }

    const columns: ColumnDef<Order, any>[] = [
        columnHelper.accessor('id', {
            header: 'ID',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('reference', {
            header: 'Référence',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('amount', {
            header: 'Montant',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('products_count', {
            header: 'Produits',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('date', {
            header: 'Commandé le',
            cell: info => new Date(info.getValue()).toLocaleDateString('fr-FR'),
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
                                    product_ids: row.original.products?.map(p => p.id) ?? [],
                                });
                                setIsEditMode(true);
                                setCurrentOrderId(row.original.id);
                                setDialogOpen(true);
                            }}
                        >
                            <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                                setOrderToDelete(row.original);
                                setAlertDialogOpen(true);
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
                                    Voulez-vous vraiment supprimer cette vente ? Action irréversible.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => {
                                        if (orderToDelete) {
                                            router.delete(route('orders.destroy', orderToDelete.id));
                                            setAlertDialogOpen(false);
                                            setOrderToDelete(null);
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
    ];

    const table = useReactTable({
        data: orders,
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
            <Head title="Liste des ventes" />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Liste des ventes</h1>

                    <div className="flex gap-2 items-center">
                        <Input
                            placeholder="Rechercher"
                            value={globalFilter}
                            onChange={e => setGlobalFilter(e.target.value)}
                            className="w-64"
                        />

                        <Dialog open={dialogOpen} onOpenChange={(open) => {
                            setDialogOpen(open);
                            if (!open) {
                                reset();
                                setIsEditMode(false);
                                setCurrentOrderId(null);
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
                                    <DialogTitle>{isEditMode ? 'Modifier la vente' : 'Ajouter une vente'}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-6">


                                </div>
                                <div className="flex justify-end">
                                    <Button onClick={handleAddOrEditOrder} disabled={processing}>
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
                                        Aucune vente trouvée.
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

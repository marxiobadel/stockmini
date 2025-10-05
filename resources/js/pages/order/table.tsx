"use client"

import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
    createColumnHelper,
    type ColumnDef,
    type SortingState,
    type Row
} from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Order } from '@/types'
import React from 'react'
import { Link, router } from '@inertiajs/react'
import { toast } from 'sonner'
import { currencyFormatter } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface OrdersTableProps {
    orders: Order[];
    globalFilter: string;
    setGlobalFilter: (value: string) => void;
    onEdit?: (order: Order) => void;
    displayEdit?: boolean;
}

export default function OrdersTable({ orders, globalFilter, setGlobalFilter, onEdit, displayEdit = true }: OrdersTableProps) {
    const columnHelper = createColumnHelper<Order>()
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [alertDialogOpen, setAlertDialogOpen] = React.useState(false)
    const [orderToDelete, setOrderToDelete] = React.useState<Order | null>(null)

    function customGlobalFilter(row: Row<Order>, columnId: string, filterValue: string): boolean {
        const search = filterValue.toLowerCase();
        return row.original.reference.toLowerCase().includes(search)
    }

    const columns: ColumnDef<Order, any>[] = [
        columnHelper.accessor('id', { header: 'ID', cell: info => info.getValue() }),
        columnHelper.accessor('reference', { header: 'Référence', cell: info => info.getValue() }),
        columnHelper.accessor('amount', { header: 'Montant', cell: info => currencyFormatter(info.getValue()) }),
        columnHelper.accessor('products_count', { header: 'Produits', cell: info => info.getValue() }),
        columnHelper.accessor('date', { header: 'Commandé le', cell: info => new Date(info.getValue()).toLocaleDateString('fr-FR') }),
        columnHelper.accessor('status', { header: 'Statut', cell: info => {
                if (info.getValue() === 'paid')
                    return (
                        <span className={'text-green-600 font-semibold'}>
                            Payé
                        </span>
                    ) 
                else if (info.getValue() === 'partial')
                    return (
                        <span className={'text-blue-600 font-semibold'}>
                            Payé en partie
                        </span>
                    )
                else 
                    return (
                        <span className={'text-orange-600 font-semibold'}>
                            En attente
                        </span>
                    )
            }
        }),
        columnHelper.accessor('created_at', { header: 'Créé le', cell: info => new Date(info.getValue()).toLocaleDateString('fr-FR') }),
        columnHelper.accessor('updated_at', { header: 'Modifié le', cell: info => new Date(info.getValue()).toLocaleDateString('fr-FR') }),
        {
            header: 'Actions',
            id: 'actions',
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link href={route('orders.show', { order: row.original.id })}>
                                    <Button size="sm" variant="outline">
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>Voir la vente</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    {displayEdit === true && <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => router.get(route('orders.edit', row.original.id))}>
                                    <Pencil className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Modifier la vente</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="sm" variant="destructive" onClick={() => { setOrderToDelete(row.original); setAlertDialogOpen(true); }}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Supprimer la vente</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
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
                                <AlertDialogAction onClick={() => {
                                    if (orderToDelete) {
                                        router.delete(route('orders.destroy', orderToDelete.id), {
                                            onSuccess: () => {
                                                toast.success('Vente supprimée', {
                                                    description: 'La vente a été supprimée avec succès.',
                                                });
                                            },
                                            onError: () => {
                                                toast.error('Erreur', {
                                                    description: 'Impossible de supprimer la vente.',
                                                });
                                            }
                                        });
                                        setAlertDialogOpen(false);
                                        setOrderToDelete(null);
                                    }
                                }}>
                                    Supprimer
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )
        },
    ]

    const table = useReactTable({
        data: orders,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn: customGlobalFilter,
        state: { sorting, globalFilter },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
    })

    return (
        <>
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
                                <TableCell colSpan={columns.length} className="text-center italic text-muted-foreground py-6">
                                    Aucune vente trouvée.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between mt-4">
                <Button variant="outline" size="sm" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>Précédent</Button>
                {table.getRowModel().rows.length > 0 && (
                    <span className="text-sm">Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}</span>
                )}
                <Button variant="outline" size="sm" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>Suivant</Button>
            </div>
        </>
    )
}

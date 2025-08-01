"use client"

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Supplier } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
    createColumnHelper,
    ColumnDef,
} from '@tanstack/react-table';
import type { SortingState } from '@tanstack/react-table'
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
import { Pencil, Trash2, Plus, Loader2Icon } from 'lucide-react'
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
    { title: 'Fournisseurs', href: route('suppliers.index') },
]

interface PageProps {
    suppliers: Supplier[]
}

const columnHelper = createColumnHelper<Supplier>()

export default function Index({ suppliers }: PageProps) {
    const [globalFilter, setGlobalFilter] = React.useState('')
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [sorting, setSorting] = React.useState<SortingState>([])

    // Pour modifier / ajouter via la même modale
    const [isEditMode, setIsEditMode] = React.useState(false)
    const [currentSupplierId, setCurrentSupplierId] = React.useState<number | null>(null)

    // Pour confirmation suppression
    const [alertDialogOpen, setAlertDialogOpen] = React.useState(false)
    const [supplierToDelete, setSupplierToDelete] = React.useState<Supplier | null>(null)

    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        phone: '',
        address: ''
    })

    const filteredData = React.useMemo(() => {
        return suppliers.filter(s =>
            s.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
            s.phone?.toLowerCase().includes(globalFilter.toLowerCase()) ||
            s.address?.toLowerCase().includes(globalFilter.toLowerCase())
        )
    }, [suppliers, globalFilter])

    const handleAddOrEditSupplier = () => {
        if (isEditMode && currentSupplierId) {
            put(route('suppliers.update', currentSupplierId), {
                onSuccess: () => {
                    setDialogOpen(false);
                    reset();
                    setIsEditMode(false);
                    setCurrentSupplierId(null);
                    toast('Fournisseur modifié', {
                        description: 'Le fournisseur a été mise à jour avec succès.',
                        duration: 4000,
                    })
                },
            })
        } else {
            post(route('suppliers.store'), {
                onSuccess: () => {
                    setDialogOpen(false);
                    reset();
                    toast('Fournisseur ajouté', {
                        description: 'Le fournisseur a été enregistré avec succès.',
                        duration: 4000,
                    })
                },
            })
        }
    }

    const columns: ColumnDef<Supplier, any>[] = [
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
        columnHelper.accessor('phone', {
            header: 'Téléphone',
            cell: info => {
                const value = info.getValue()
                return value?.trim() ? value : <span className="italic text-muted-foreground">Aucun téléphone</span>
            },
        }),
        columnHelper.accessor('address', {
            header: 'Adresse',
            cell: info => {
                const value = info.getValue()
                return value?.trim() ? value : <span className="italic text-muted-foreground">Aucun adresse</span>
            },
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
                                    phone: row.original.phone || '',
                                    address: row.original.address || '',
                                })
                                setIsEditMode(true)
                                setCurrentSupplierId(row.original.id)
                                setDialogOpen(true)
                            }}
                        >
                            <Pencil className="w-4 h-4" />
                        </Button>

                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                                setSupplierToDelete(row.original)
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
                                    Êtes-vous sûr·e de vouloir supprimer le fournisseur &quot;{supplierToDelete?.name}&quot; ? Cette action est irréversible.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => {
                                        if (supplierToDelete) {
                                            router.delete(route('suppliers.destroy', supplierToDelete.id))
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
                    <h1 className="text-2xl font-bold">Liste des fournisseurs</h1>

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
                                setCurrentSupplierId(null);
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
                                    <DialogTitle>{isEditMode ? 'Modifier le fournisseur' : 'Ajouter un fournisseur'}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-6">
                                    <div className="space-y-1">
                                        <Label htmlFor="name">Nom <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            placeholder="Ex: Informatique, Vêtements..."
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                                                <span className="inline-block w-4 h-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M4.293 4.293l15.414 15.414M12 20.5A8.5 8.5 0 113.5 12 8.5 8.5 0 0112 20.5z" />
                                                    </svg>
                                                </span>
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="phone">Téléphone</Label>
                                        <Input
                                            id="phone"
                                            value={data.phone}
                                            onChange={e => setData('phone', e.target.value)}
                                            placeholder="Ex: 672816752."
                                        />
                                        {errors.phone && (
                                            <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                                                <span className="inline-block w-4 h-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M4.293 4.293l15.414 15.414M12 20.5A8.5 8.5 0 113.5 12 8.5 8.5 0 0112 20.5z" />
                                                    </svg>
                                                </span>
                                                {errors.phone}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="address">Adresse</Label>
                                        <Input
                                            id="address"
                                            value={data.address}
                                            onChange={e => setData('address', e.target.value)}
                                            placeholder="Ex: Mendong, Camp SIC"
                                        />
                                        {errors.address && (
                                            <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                                                <span className="inline-block w-4 h-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M4.293 4.293l15.414 15.414M12 20.5A8.5 8.5 0 113.5 12 8.5 8.5 0 0112 20.5z" />
                                                    </svg>
                                                </span>
                                                {errors.address}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex justify-end">
                                        <Button onClick={handleAddOrEditSupplier} disabled={processing}>
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
                                        Aucun fournisseur trouvé.
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

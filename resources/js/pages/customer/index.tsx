"use client"

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
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
    { title: 'Clients', href: route('customers.index') },
]

interface PageProps {
    customers: User[]
}

const columnHelper = createColumnHelper<User>()

export default function Index({ customers }: PageProps) {
    const [globalFilter, setGlobalFilter] = React.useState('')
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [sorting, setSorting] = React.useState<SortingState>([])

    // Pour modifier / ajouter via la même modale
    const [isEditMode, setIsEditMode] = React.useState(false)
    const [currentCustomerId, setCurrentCustomerId] = React.useState<number | null>(null)

    // Pour confirmation suppression
    const [alertDialogOpen, setAlertDialogOpen] = React.useState(false)
    const [customerToDelete, setCustomerToDelete] = React.useState<User | null>(null)

    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        phone: '',
        email: '',
        address: '',
    })

    const filteredData = React.useMemo(() => {
        return customers.filter(c =>
            c.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
            c.email?.toLowerCase().includes(globalFilter.toLowerCase())
        )
    }, [customers, globalFilter])

    const handleAddOrEditCustomer = () => {
        if (isEditMode && currentCustomerId) {
            put(route('customers.update', currentCustomerId), {
                onSuccess: () => {
                    setDialogOpen(false);
                    reset();
                    setIsEditMode(false);
                    setCurrentCustomerId(null);
                    toast('Client modifié', {
                        description: 'Le client a été mise à jour avec succès.',
                        duration: 4000,
                    })
                },
            })
        } else {
            post(route('customers.store'), {
                onSuccess: () => {
                    setDialogOpen(false);
                    reset();
                    toast('Client ajouté', {
                        description: 'Le nouveau client a été enregistré avec succès.',
                        duration: 4000,
                    })
                },
            })
        }
    }

    const columns: ColumnDef<User, any>[] = [
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
        columnHelper.accessor('email', {
            header: ({ column }) => (
                <div
                    onClick={() => column.toggleSorting()}
                    className="cursor-pointer select-none flex items-center gap-1"
                >
                    E-mail
                    {column.getIsSorted() === 'asc' && <span>↑</span>}
                    {column.getIsSorted() === 'desc' && <span>↓</span>}
                </div>
            ),
            cell: info => {
                const value = info.getValue()
                return value?.trim() ? value : <span className="italic text-muted-foreground">Aucun e-mail</span>
            },
            enableSorting: true,
        }),
        columnHelper.accessor('phone', {
            header: ({ column }) => (
                <div
                    onClick={() => column.toggleSorting()}
                    className="cursor-pointer select-none flex items-center gap-1"
                >
                    E-mail
                    {column.getIsSorted() === 'asc' && <span>↑</span>}
                    {column.getIsSorted() === 'desc' && <span>↓</span>}
                </div>
            ),
            cell: info => {
                const value = info.getValue()
                return value?.trim() ? value : <span className="italic text-muted-foreground">Aucun téléphone</span>
            },
            enableSorting: true,
        }),
        columnHelper.accessor('address', {
            header: ({ column }) => (
                <div
                    onClick={() => column.toggleSorting()}
                    className="cursor-pointer select-none flex items-center gap-1"
                >
                    Adresse
                    {column.getIsSorted() === 'asc' && <span>↑</span>}
                    {column.getIsSorted() === 'desc' && <span>↓</span>}
                </div>
            ),
            cell: info => {
                const value = info.getValue()
                return value?.trim() ? value : <span className="italic text-muted-foreground">Aucune adresse</span>
            },
            enableSorting: true,
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
                                    email: row.original.email || '',
                                    address: row.original.address || '',
                                })
                                setIsEditMode(true)
                                setCurrentCustomerId(row.original.id)
                                setDialogOpen(true)
                            }}
                        >
                            <Pencil className="w-4 h-4" />
                        </Button>

                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                                setCustomerToDelete(row.original)
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
                                    Êtes-vous sûr·e de vouloir supprimer le client &quot;{customerToDelete?.name}&quot; ? Cette action est irréversible.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => {
                                        if (customerToDelete) {
                                            router.delete(route('customers.destroy', customerToDelete.id))
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
            <Head title="Liste des clients" />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Clients</h1>

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
                                setCurrentCustomerId(null);
                            }
                        }}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Ajouter un client
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{isEditMode ? 'Modifier le client' : 'Ajouter un client'}</DialogTitle>
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
                                                <FileWarning className="w-4 h-4" />
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="email">E-mail</Label>
                                        <Input
                                            id="email"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            placeholder="Ex: customer@example.com"
                                        />
                                        {errors.email && (
                                            <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                                                <FileWarning className="w-4 h-4" />
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="phone">Téléphone</Label>
                                        <Input
                                            id="phone"
                                            value={data.phone}
                                            onChange={e => setData('phone', e.target.value)}
                                            placeholder="Ex: 654789963"
                                        />
                                        {errors.phone && (
                                            <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                                                <FileWarning className="w-4 h-4" />
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
                                                <FileWarning className="w-4 h-4" />
                                                {errors.address}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex justify-end">
                                        <Button onClick={handleAddOrEditCustomer} disabled={processing}>
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
                                        Aucun client trouvé.
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

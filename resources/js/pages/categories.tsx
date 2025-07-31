import AppLayout from '@/layouts/app-layout'
import { Category, type BreadcrumbItem } from '@/types'
import { Head, router, usePage } from '@inertiajs/react'
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    flexRender,
    createColumnHelper,
    ColumnDef,
} from '@tanstack/react-table'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Trash2 } from 'lucide-react'
import React from 'react'

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tableau de bord', href: route('dashboard') },
    { title: 'Catégories', href: route('categories.index') },
]

interface PageProps {
    categories: Category[]
}

const columnHelper = createColumnHelper<Category>()

export default function Index({ categories }: PageProps) {
    const [globalFilter, setGlobalFilter] = React.useState('')

    const filteredData = React.useMemo(() => {
        return categories.filter(c =>
            c.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
            c.description?.toLowerCase().includes(globalFilter.toLowerCase())
        )
    }, [categories, globalFilter])

    const columns: ColumnDef<Category, any>[] = [
        columnHelper.accessor('id', {
            header: 'ID',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('name', {
            header: 'Nom',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('description', {
            header: 'Description',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('created_at', {
            header: 'Créé le',
            cell: info => new Date(info.getValue()).toLocaleDateString('fr-FR'),
        }),
        {
            header: 'Actions',
            id: 'actions',
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => router.visit(route('categories.edit', row.original.id))}>
                        <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                            if (confirm('Supprimer cette catégorie ?')) {
                                router.delete(route('categories.destroy', row.original.id))
                            }
                        }}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            ),
        },
    ]

    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Liste des catégories" />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Catégories de produits</h1>
                    <Input
                        placeholder="Rechercher..."
                        value={globalFilter}
                        onChange={e => setGlobalFilter(e.target.value)}
                        className="w-64"
                    />
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
                            {table.getRowModel().rows.map(row => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
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
                    <span className="text-sm">
                        Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
                    </span>
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
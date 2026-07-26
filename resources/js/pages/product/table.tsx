"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { flexRender, Table as ReactTable } from "@tanstack/react-table"
import { router } from "@inertiajs/react"
import { Product } from "@/types"

interface ProductTableProps<TData> {
    products: {
        data: Product[];
        links: any[];
        meta: { current_page: number; last_page: number; total: number; per_page: number };
    };
    table: ReactTable<TData>;
}

export default function ProductTable<TData>({ table, products }: ProductTableProps<TData>) {
    const currentPage = products.meta.current_page;
    const lastPage = products.meta.last_page;

    const sortByColumn = (columnId: string, currentSort?: 'asc' | 'desc' | null) => {
        if (!['name'].includes(columnId)) return;

        const nextSort = currentSort === 'asc' ? 'desc' : currentSort === 'desc' ? null : 'asc';
        router.visit(route('products.index'), {
            method: 'get',
            data: { sort: columnId, direction: nextSort, page: currentPage },
            preserveState: true,
        });
    }

    const goToPage = (page: number) => {
        router.visit(route('products.index'), {
            method: 'get',
            data: { 
                sort: table.getState().sorting[0]?.id || null, 
                direction: table.getState().sorting[0]?.desc ? 'desc' : 'asc',
                page 
            },
            preserveState: true,
        });
    }

    return (
        <>
            <div className="border rounded-md overflow-x-auto">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <TableHead
                                        key={header.id}
                                        className="cursor-pointer select-none"
                                        onClick={() => sortByColumn(header.column.id, header.column.getIsSorted() as 'asc' | 'desc' | null)}
                                    >
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
                                <TableCell
                                    colSpan={table.getAllColumns().length}
                                    className="text-center italic text-muted-foreground py-6"
                                >
                                    Aucun produit trouvé.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => goToPage(currentPage - 1)}
                >
                    Précédent
                </Button>
                {products.meta.total > 0 && (
                    <span className="text-sm">
                        Page {products.meta.current_page} sur {products.meta.last_page}
                    </span>
                )}
                <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= lastPage}
                    onClick={() => goToPage(currentPage + 1)}
                >
                    Suivant
                </Button>
            </div>
        </>
    )
}

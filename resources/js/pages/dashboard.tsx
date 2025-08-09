import * as React from "react"
import { router, Head } from "@inertiajs/react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

import AppLayout from '@/layouts/app-layout'
import { Order, type BreadcrumbItem } from '@/types'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { currencyFormatter } from '@/lib/utils'
import { DateRangePicker } from "@/components/daterange-picker"
import { DollarSign, ShoppingCart, User } from "lucide-react"

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tableau de bord', href: '/' },
]

interface PageProps {
    orders: Order[];
    filters?: {
        from?: string
        to?: string
    }
}

export default function Dashboard({ orders, filters }: PageProps) {
    const handleDateChange = (range: { from?: Date; to?: Date } | undefined) => {
        if (range?.from && range?.to) {
            router.get(
                route("dashboard"),
                {
                    from: format(range.from, "yyyy-MM-dd"),
                    to: format(range.to, "yyyy-MM-dd"),
                },
                { preserveState: true }
            )
        }
    }

    const total_amount = React.useMemo(() => orders.reduce((carry, order) => carry + order.amount, 0), [orders]);

    const uniqueClientsCount = React.useMemo(() => new Set(orders.map(o => o.customer?.id).filter(Boolean)).size, [orders]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tableau de bord" />

            {/* Date range picker */}
            <div className="flex justify-end my-4 mx-4">
                <DateRangePicker
                    initialFrom={filters?.from}
                    initialTo={filters?.to}
                    onChange={handleDateChange}
                />
            </div>
            <div className="flex gap-6 mx-4 mb-8">
                {/* Montant total */}
                <div className="flex flex-1 items-center gap-4 rounded-lg bg-white dark:bg-gray-900 shadow-md p-6">
                    <div className="rounded-full bg-green-100 dark:bg-green-800 p-3">
                        <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Montant total</p>
                        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{currencyFormatter(total_amount)}</p>
                    </div>
                </div>

                {/* Exemple autre carte: nombre de commandes */}
                <div className="flex flex-1 items-center gap-4 rounded-lg bg-white dark:bg-gray-900 shadow-md p-6">
                    <div className="rounded-full bg-blue-100 dark:bg-blue-800 p-3">
                        <ShoppingCart className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Commandes</p>
                        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{orders.length}</p>
                    </div>
                </div>

                {/* Exemple autre carte: clients */}
                <div className="flex flex-1 items-center gap-4 rounded-lg bg-white dark:bg-gray-900 shadow-md p-6">
                    <div className="rounded-full bg-purple-100 dark:bg-purple-800 p-3">
                        <User className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Clients</p>
                        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                            { /* Par exemple, nombre unique de clients */}
                            {uniqueClientsCount}
                        </p>
                    </div>
                </div>
            </div>
            {/* Orders table */}
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    {orders.slice(0, 10).length > 0 && (
                        <h3 className="text-lg font-semibold mt-4 mb-2 mx-2">
                            {orders.slice(0, 10).length > 1
                                ? `Liste des ${orders.slice(0, 10).length} dernières ventes`
                                : "Dernière vente"}
                        </h3>
                    )}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Référence</TableHead>
                                <TableHead>Montant</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Produits</TableHead>
                                <TableHead>Client</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.slice(0, 10).length > 0 ? (
                                orders.slice(0, 10).map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">{order.reference}</TableCell>
                                        <TableCell>{currencyFormatter(order.amount)}</TableCell>
                                        <TableCell>
                                            {format(new Date(order.date), "dd MMM yyyy", { locale: fr })}
                                        </TableCell>
                                        <TableCell>{order.products_count}</TableCell>
                                        <TableCell>
                                            {order.customer ? (
                                                order.customer.name
                                            ) : (
                                                <span className="italic text-muted-foreground">Non défini</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-gray-500">
                                        Aucune vente trouvée.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    )
}

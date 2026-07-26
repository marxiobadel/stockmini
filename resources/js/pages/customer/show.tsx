"use client"

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Order, type User } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Input } from '@/components/ui/input'
import React from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import OrdersTable from '../order/table';
import { DateRangePicker } from "@/components/daterange-picker";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DollarSign, ShoppingCart } from 'lucide-react';
import { currencyFormatter } from '@/lib/utils';

interface PageProps {
    orders: Order[];
    customer: User;
    filters?: {
        from?: string
        to?: string
    }
}

export default function Show({ orders, customer, filters }: PageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Tableau de bord', href: route('dashboard') },
        { title: 'Clients', href: route('customers.index') },
        { title: 'Détails Client', href: route('customers.show', customer.id) },
    ];

    const [globalFilter, setGlobalFilter] = React.useState('');
    const [alertDialogOpen, setAlertDialogOpen] = React.useState(false);
    const [orderToDelete, setOrderToDelete] = React.useState<Order | null>(null);

    const handleDateChange = (range: { from?: Date; to?: Date } | undefined) => {
        if (range?.from && range?.to) {
            router.get(
                route('customers.show', customer.id),
                {
                    from: format(range.from, "yyyy-MM-dd"),
                    to: format(range.to, "yyyy-MM-dd"),
                },
                { preserveState: true }
            )
        }
    }

    const total_amount = React.useMemo(() => orders.reduce((carry, order) => carry + order.amount, 0), [orders]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Détails Client" />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex justify-end my-4">
                    <DateRangePicker
                        initialFrom={filters?.from}
                        initialTo={filters?.to}
                        onChange={handleDateChange}
                    />
                </div>
                <div className="flex gap-6 my-8 mb-8">
                    {/* Montant total */}
                    <div className="flex flex-1 items-center gap-4 rounded-lg bg-white dark:bg-gray-900 border border-1 p-6">
                        <div className="rounded-full bg-green-100 dark:bg-green-800 p-3">
                            <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Montant total</p>
                            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                                {currencyFormatter(total_amount)}
                            </p>
                        </div>
                    </div>

                    {/* Exemple autre carte: nombre de commandes */}
                    <div className="flex flex-1 items-center gap-4 rounded-lg bg-white dark:bg-gray-900 border border-1 p-6">
                        <div className="rounded-full bg-blue-100 dark:bg-blue-800 p-3">
                            <ShoppingCart className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Commandes</p>
                            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{orders.length}</p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Liste des ventes</h1>

                    <div className="flex gap-2 items-center">
                        <Input
                            placeholder="Rechercher"
                            value={globalFilter}
                            onChange={e => setGlobalFilter(e.target.value)}
                            className="w-64"
                        />
                    </div>
                </div>

                <OrdersTable
                    orders={orders}
                    globalFilter={globalFilter}
                    setGlobalFilter={setGlobalFilter}
                    displayEdit={false}
                />

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
            </div>
        </AppLayout>
    );
}

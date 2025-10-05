"use client"

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Order } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'
import React from 'react';
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
import OrdersTable from './table';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tableau de bord', href: route('dashboard') },
    { title: 'Ventes', href: route('orders.index') },
]

interface PageProps {
    orders: Order[];
}

export default function Index({ orders }: PageProps) {
    const [globalFilter, setGlobalFilter] = React.useState('')
    const [alertDialogOpen, setAlertDialogOpen] = React.useState(false)
    const [orderToDelete, setOrderToDelete] = React.useState<Order | null>(null)

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

                        <Button onClick={() => router.get(route('orders.create'))}>
                            <Plus className="w-4 h-4 mr-2" /> Ajouter une vente
                        </Button>
                    </div>
                </div>

                <OrdersTable
                    orders={orders}
                    globalFilter={globalFilter}
                    setGlobalFilter={setGlobalFilter}
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

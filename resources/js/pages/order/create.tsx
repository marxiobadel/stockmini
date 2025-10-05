import AppLayout from '@/layouts/app-layout';
import OrderForm from './components/form';
import { Head } from '@inertiajs/react';
import type { BreadcrumbItem, Product, User } from '@/types';

interface Props {
    products: Product[];
    customers: User[];
}

export default function Create({ products, customers }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Tableau de bord', href: route('dashboard') },
        { title: 'Ventes', href: route('orders.index') },
        { title: 'Nouvelle vente', href: route('orders.create') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nouvelle vente" />
            <div className="p-6 max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Nouvelle vente</h1>
                <OrderForm products={products} customers={customers} />
            </div>
        </AppLayout>
    );
}

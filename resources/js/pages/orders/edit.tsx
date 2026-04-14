import AppLayout from '@/layouts/app-layout';
import OrderForm from './components/form';
import { Head } from '@inertiajs/react';
import type { Product, User, Order, BreadcrumbItem } from '@/types';

interface Props {
    order: Order;
    products: Product[];
    customers: User[];
}

export default function Edit({ order, products, customers }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Tableau de bord', href: route('dashboard') },
        { title: 'Ventes', href: route('orders.index') },
        { title: 'vente #'+ order.reference, href: route('orders.edit', order.id) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Modifier la vente #${order.id}`} />
            <div className="p-4 sm:p-6 w-full mx-auto">
                <h1 className="text-2xl font-bold mb-6">Modifier la vente</h1>
                <OrderForm order={order} products={products} customers={customers} />
            </div>
        </AppLayout>
    );
}

import AppLayout from '@/layouts/app-layout';
import OrderForm from './components/form';
import { Head } from '@inertiajs/react';
import type { BreadcrumbItem, Product, User } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';

interface Props {
    products: Product[];
    customers: User[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tableau de bord', href: route('dashboard') },
    { title: 'Ventes', href: route('orders.index') },
    { title: 'Nouvelle vente', href: route('orders.create') },
];

export default function Create({ products, customers }: Props) {
    const isMobile = useIsMobile();

    return (
        <AppLayout breadcrumbs={isMobile ? [] : breadcrumbs}>
            <Head title="Nouvelle vente" />
            <div className="p-4 sm:p-6 w-full mx-auto">
                <h1 className="text-2xl font-bold mb-6">Nouvelle vente</h1>
                <OrderForm products={products} customers={customers} />
            </div>
        </AppLayout>
    );
}

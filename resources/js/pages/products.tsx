import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tableau de bord',
        href: route('dashboard'),
    },
    {
        title: 'Produits',
        href: route('products.index'),
    },
];

export default function Products() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Liste des produits" />
            <div className='flex-1 items-center justify-center'>
                
            </div>
        </AppLayout>
    );
}

import AppLayout from "@/layouts/app-layout";
import { currencyFormatter, plural } from "@/lib/utils";
import { BreadcrumbItem, Order } from "@/types";
import { Head } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { File, Printer } from "lucide-react";
import React from 'react';

interface PageProps {
    order: Order;
}

export default function Show({ order }: PageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Tableau de bord', href: route('dashboard') },
        { title: 'Ventes', href: route('orders.index') },
        { title: `Vente #${order.id}`, href: route('orders.show', order.id) },
    ];

    const iframeRef = React.useRef<HTMLIFrameElement>(null);

    const handlePrint = () => {
        const iframe = iframeRef.current;
        if (iframe?.contentWindow) {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        } else {
            alert('PDF not loaded yet. Please try again.')
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Détails Vente #${order.reference}`} />

            <div className="p-6 space-y-6 bg-white rounded-2xl">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold mb-1">Vente #{order.reference}</h1>
                        <p className="text-black text-sm">
                            Date : {new Date(order.created_at).toLocaleDateString('fr-FR')}
                        </p>
                        {order.customer &&
                        <p className="text-black text-sm">
                            Client : {order.customer.name}
                        </p>}
                        <p className="text-black text-md">
                            Total : <span className="font-extrabold">{currencyFormatter(order.amount)}</span>
                        </p>
                        <p className="text-black text-md">
                            Total Payé: <span className="font-extrabold">{currencyFormatter(order.total_paid)}</span>
                        </p>
                        <p className="text-black text-md">
                            Total Restant : <span className="font-extrabold">{currencyFormatter(order.remaining)}</span>
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(route('orders.print', order.id), '_blank')}
                    >
                        <File className="w-4 h-4 mr-2" />
                        Afficher la facture
                    </Button>
                    <div>
                        <iframe
                            ref={iframeRef}
                            src={route('orders.print', order.id)}
                            style={{ display: 'none' }}
                            title="invoice-pdf"
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrint}
                        >
                        <Printer className="w-4 h-4 mr-2" />
                        Imprimer la facture
                    </Button>
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-semibold mb-2">Produits</h2>
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium text-gray-600">Produit</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-600">Quantité</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-600">Prix unitaire</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-600">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.products?.map(product => (
                                    <tr key={product.id} className="border-t">
                                        <td className="px-4 py-2">{product.name}</td>
                                        <td className="px-4 py-2">{plural(product.pivot?.quantity ?? 1, product.unity.name)}</td>
                                        <td className="px-4 py-2">
                                            {product.pivot ? currencyFormatter(product.pivot.price) : "-"}
                                        </td>
                                        <td className="px-4 py-2">
                                            {product.pivot
                                                ? currencyFormatter(product.pivot.price * (product.pivot.quantity ?? 1))
                                                : "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}

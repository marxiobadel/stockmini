import AppLayout from "@/layouts/app-layout";
import { currencyFormatter } from "@/lib/utils";
import { BreadcrumbItem, Product } from "@/types";
import { Head } from "@inertiajs/react";

interface PageProps {
    product: Product;
}

export default function Show({ product }: PageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Tableau de bord', href: route('dashboard') },
        { title: 'Produits', href: route('products.index') },
        { title: `Produit #${product.id}`, href: route('products.show', product.id) },
    ];

    const isLowStock = product.quantity_in_stock <= product.threshold_alert;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={product.name} />
            <div className="bg-white rounded-xl overflow-hidden">
                {/* En-tête produit */}
                <div className="bg-gray-50 px-6 py-5 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">{product.name}</h1>
                        <p className="text-sm text-gray-500">Référence #{product.id}</p>
                    </div>
                    {isLowStock && (
                        <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                            Stock bas
                        </span>
                    )}
                </div>

                {/* Corps */}
                <div className="p-6 space-y-6">
                    {/* Description */}
                    {product.description && (
                        <div>
                            <h2 className="text-lg font-medium text-gray-800 mb-2">Description</h2>
                            <p className="text-gray-600 leading-relaxed">{product.description}</p>
                        </div>
                    )}

                    {/* Informations clés */}
                    <div>
                        <h2 className="text-lg font-medium text-gray-800 mb-4">Informations</h2>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Catégorie</dt>
                                <dd className="text-gray-900">{product.category?.name}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Unité</dt>
                                <dd className="text-gray-900">{product.unity?.name}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Quantité en stock</dt>
                                <dd className={`font-semibold ${isLowStock ? "text-red-600" : "text-gray-900"}`}>
                                    {product.quantity_in_stock}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Seuil d'alerte</dt>
                                <dd className="text-gray-900">{product.threshold_alert}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Prix de vente</dt>
                                <dd className="text-gray-900">{currencyFormatter(product.selling_price)}</dd>
                            </div>
                            {product.purchasing_price !== null && (
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Prix d'achat</dt>
                                    <dd className="text-gray-900">{currencyFormatter(product.purchasing_price)}</dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    {/* Dates */}
                    <div className="pt-4 border-t border-gray-200">
                        <h2 className="text-lg font-medium text-gray-800 mb-4">Historique</h2>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Créé le</dt>
                                <dd className="text-gray-900">
                                    {new Date(product.created_at).toLocaleDateString()}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Dernière modification</dt>
                                <dd className="text-gray-900">
                                    {new Date(product.updated_at).toLocaleDateString()}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}

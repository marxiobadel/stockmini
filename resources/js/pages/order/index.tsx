"use client"

import AppLayout from '@/layouts/app-layout';
import { type Product, type BreadcrumbItem, Order } from '@/types';
import { Head, router } from '@inertiajs/react';
import { toast } from "sonner";
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Loader2Icon } from 'lucide-react'
import React from 'react'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useForm } from '@inertiajs/react'

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
import { currencyFormatter } from '@/lib/utils';
import OrdersTable from './orders-table';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tableau de bord', href: route('dashboard') },
    { title: 'Ventes', href: route('orders.index') },
]

interface PageProps {
    orders: Order[];
    products: Product[];
}

export default function Index({ products, orders }: PageProps) {
    const [globalFilter, setGlobalFilter] = React.useState('')
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [isEditMode, setIsEditMode] = React.useState(false)
    const [currentOrderId, setCurrentOrderId] = React.useState<number | null>(null)
    const [alertDialogOpen, setAlertDialogOpen] = React.useState(false)
    const [orderToDelete, setOrderToDelete] = React.useState<Order | null>(null)
    const [productSearch, setProductSearch] = React.useState('');

    const { data, setData, post, put, processing, reset } = useForm<{
        product_ids: number[];
        product_quantities: Record<number, number>; // id → quantité
    }>({
        product_ids: [],
        product_quantities: {},
    });

    const selectedCount = data.product_ids.length;
    const maxToShow = selectedCount > 8 ? selectedCount : 8;

    const handleAddOrEditOrder = () => {
        if (isEditMode && currentOrderId) {
            put(route('orders.update', currentOrderId), {
                onSuccess: () => {
                    setDialogOpen(false);
                    reset();
                    setIsEditMode(false);
                    setCurrentOrderId(null);
                    toast('Vente modifiée', {
                        description: 'La vente a été mise à jour avec succès.',
                        duration: 4000,
                    })
                },
                onError: (errors) => {
                    toast.error('Erreur lors de la modification', {
                        description: Object.values(errors).join(', '),
                    });
                }
            })
        } else {
            post(route('orders.store'), {
                onSuccess: () => {
                    setDialogOpen(false);
                    reset();
                    toast('Vente ajoutée', {
                        description: 'La vente a été enregistrée avec succès.',
                        duration: 4000,
                    })
                },
                onError: (errors) => {
                    toast.error('Erreur lors de l\'ajout', {
                        description: Object.values(errors).join(', '),
                        duration: 10000
                    });
                }
            })
        }
    }

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

                        <Dialog
                            open={dialogOpen}
                            onOpenChange={(open) => {
                                setDialogOpen(open);
                                if (!open) {
                                    reset();
                                    setIsEditMode(false);
                                    setCurrentOrderId(null);
                                    setProductSearch('');
                                }
                            }}
                        >
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" /> Ajouter
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="w-[800px]">
                                <DialogHeader>
                                    <DialogTitle>{isEditMode ? 'Modifier la vente' : 'Ajouter une vente'}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-6">
                                    <div className="space-y-1">
                                        <Label htmlFor="product_search">Rechercher un produit</Label>
                                        <Input
                                            id="product_search"
                                            placeholder="Tapez le nom du produit..."
                                            value={productSearch}
                                            onChange={e => setProductSearch(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1 space-y-2 max-h-64 overflow-y-auto border rounded-md p-2">
                                            {products
                                                .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                                                .sort((a, b) => {
                                                    // Trier pour mettre en haut ceux qui sont sélectionnés
                                                    const aSelected = data.product_ids.includes(a.id) ? -1 : 1;
                                                    const bSelected = data.product_ids.includes(b.id) ? -1 : 1;
                                                    return aSelected - bSelected;
                                                })
                                                .slice(0, maxToShow)
                                                .map(product => {
                                                    const selected = data.product_ids.includes(product.id);
                                                    return (
                                                        <label key={product.id} className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={selected}
                                                                onChange={() => {
                                                                    if (selected) {
                                                                        setData({
                                                                            ...data,
                                                                            product_ids: data.product_ids.filter(id => id !== product.id),
                                                                            product_quantities: Object.fromEntries(
                                                                                Object.entries(data.product_quantities).filter(([id]) => Number(id) !== product.id)
                                                                            )
                                                                        });
                                                                    } else {
                                                                        setData({
                                                                            ...data,
                                                                            product_ids: [...data.product_ids, product.id],
                                                                            product_quantities: {
                                                                                ...data.product_quantities,
                                                                                [product.id]: 1
                                                                            }
                                                                        });
                                                                    }
                                                                }}
                                                            />
                                                            <span className="flex flex-col">
                                                                <span className="font-medium">{product.name}</span>
                                                                <span className="text-xs text-muted-foreground">{currencyFormatter(product.selling_price)}</span>
                                                            </span>
                                                        </label>
                                                    )
                                                })}
                                            {products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).length === 0 && (
                                                <p className="text-center text-sm italic text-muted-foreground">
                                                    Aucun produit trouvé.
                                                </p>
                                            )}
                                        </div>

                                        <div className="w-48 space-y-2 border rounded-md p-2">
                                            <p className="font-medium mb-2">Quantités</p>
                                            {data.product_ids.length === 0 && (
                                                <p className="text-sm italic text-muted-foreground">Sélectionnez des produits.</p>
                                            )}
                                            {data.product_ids.map(productId => {
                                                const product = products.find(p => p.id === productId);
                                                return product ? (
                                                    <div key={productId} className="flex items-center gap-2">
                                                        <span className="flex-1 truncate text-sm">{product.name}</span>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            className="w-16 h-8 px-1 py-0 text-sm"
                                                            value={data.product_quantities[productId] ?? 1}
                                                            onChange={e => {
                                                                const qty = parseInt(e.target.value, 10);
                                                                setData('product_quantities', {
                                                                    ...data.product_quantities,
                                                                    [productId]: qty > 0 ? qty : 1
                                                                });
                                                            }}
                                                        />
                                                    </div>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{data.product_ids.length} produit(s) sélectionné(s)</p>
                                </div>
                                <div className="flex justify-end">
                                    <Button onClick={handleAddOrEditOrder} disabled={processing}>
                                        {processing && <Loader2Icon className="animate-spin mr-2" />}
                                        {processing ? 'Enregistrement...' : 'Enregistrer'}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <OrdersTable
                    orders={orders}
                    globalFilter={globalFilter}
                    setGlobalFilter={setGlobalFilter}
                    onEdit={(order) => {
                        setData({
                            product_ids: order.products?.map(p => p.id) ?? [],
                            product_quantities: order.products?.reduce((acc, product) => {
                                acc[product.id] = product.pivot?.quantity ?? 1;
                                return acc;
                            }, {} as Record<number, number>) ?? {}
                        });
                        setIsEditMode(true);
                        setCurrentOrderId(order.id);
                        setDialogOpen(true);
                    }}
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

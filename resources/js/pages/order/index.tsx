"use client"

import AppLayout from '@/layouts/app-layout';
import { type Product, type BreadcrumbItem, type Order, type User } from '@/types';
import { Head, router } from '@inertiajs/react';
import { toast } from "sonner";
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Loader2Icon } from 'lucide-react'
import React from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
import { currencyFormatter, plural } from '@/lib/utils';
import OrdersTable from './table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tableau de bord', href: route('dashboard') },
    { title: 'Ventes', href: route('orders.index') },
]

interface PageProps {
    orders: Order[];
    products: Product[];
    customers: User[];
}

export default function Index({ products, orders, customers }: PageProps) {
    const [globalFilter, setGlobalFilter] = React.useState('')
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [isEditMode, setIsEditMode] = React.useState(false)
    const [currentOrderId, setCurrentOrderId] = React.useState<number | null>(null)
    const [alertDialogOpen, setAlertDialogOpen] = React.useState(false)
    const [orderToDelete, setOrderToDelete] = React.useState<Order | null>(null)
    const [productSearch, setProductSearch] = React.useState('');

    const { data, setData, post, put, processing, reset } = useForm<{
        status: string;
        customer_id?: string;
        product_ids: number[];
        product_quantities: Record<number, number>; // id → quantité
        product_prices: Record<number, number>;
    }>({
        status: 'paid',
        customer_id: '',
        product_ids: [],
        product_quantities: {},
        product_prices: {},
    });

    const [productPrices, setProductPrices] = React.useState<Record<number, number>>({});

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

    const total = React.useMemo(() => {
        return data.product_ids.reduce((sum, productId) => {
            const qty = data.product_quantities[productId] ?? 1;
            const price = data.product_prices[productId] ?? productPrices[productId] ?? products.find(p => p.id === productId)?.selling_price ?? 0;
            return sum + price * qty;
        }, 0);
    }, [data.product_ids, data.product_quantities, data.product_prices, productPrices]);

    React.useEffect(() => {
        const now = new Date();

        const newPrices = data.product_ids.reduce((acc, productId) => {
            const product = products.find(p => p.id === productId);
            if (!product) return acc;

            const qty = data.product_quantities[productId] ?? 1;
            let price = product.selling_price;

            if (product.specific_prices?.length) {
                const applicablePrices = product.specific_prices.filter(sp => {
                    const start = sp.start_date ? new Date(sp.start_date) : null;
                    const end = sp.end_date ? new Date(sp.end_date) : null;
                    const validDate = (!start || start <= now) && (!end || end >= now);
                    const validQuantity = qty >= sp.from_quantity;
                    const clientMatch =
                        sp.customer_ids.length === 0 ||
                        (data.customer_id && sp.customer_ids.includes(parseInt(data.customer_id)));

                    return validDate && validQuantity && clientMatch;
                });

                if (applicablePrices.length > 0) {
                    price = applicablePrices.reduce((best, sp) => {
                        let spPrice = product.selling_price;
                        if (sp.reduction_type === 'percent') {
                            spPrice = product.selling_price * (1 - Number(sp.reduction_value) / 100);
                        } else if (sp.reduction_type === 'amount') {
                            spPrice = Math.max(0, product.selling_price - Number(sp.reduction_value));
                        }
                        return spPrice < best ? spPrice : best;
                    }, price);
                }
            }

            acc[productId] = price;
            return acc;
        }, {} as Record<number, number>);

        // Fusionner uniquement les prix manquants
        const merged = { ...data.product_prices };
        let hasChanged = false;

        Object.entries(newPrices).forEach(([pid, price]) => {
            const id = Number(pid);
            if (merged[id] === undefined) {
                merged[id] = price;
                hasChanged = true;
            }
        });

        if (hasChanged) {
            setData('product_prices', merged);
        }
    }, [data.customer_id, data.product_ids, data.product_quantities, products]);

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
                                    <Plus className="w-4 h-4 mr-2" /> Ajouter une vente
                                </Button>
                            </DialogTrigger>
                            <DialogContent isOrderModal={true} className="w-3xl">
                                <DialogHeader>
                                    <DialogTitle>{isEditMode ? 'Modifier la vente' : 'Ajouter une vente'}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-6">
                                    <div className="flex space-x-4">
                                        <div className="w-1/2 space-y-1">
                                            <Label htmlFor="customer_id">Client</Label>
                                            <div className="flex items-center gap-2">
                                                <Select
                                                    value={data.customer_id}
                                                    onValueChange={(value) => setData('customer_id', value)}
                                                >
                                                    <SelectTrigger className="flex-1">
                                                        <SelectValue placeholder="Sélectionner un client" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {customers.map(customer => (
                                                            <SelectItem key={customer.id} value={String(customer.id)}>
                                                                {customer.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                {data.customer_id && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setData('customer_id', '')}
                                                        title="Retirer le client"
                                                    >
                                                        ✕
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="w-1/2 space-y-1">
                                            <Label htmlFor="status">Statut</Label>
                                            <div className="flex items-center gap-2">
                                                <Select
                                                    value={data.status}
                                                    onValueChange={(value) => setData('status', value)}
                                                >
                                                    <SelectTrigger className="flex-1">
                                                        <SelectValue placeholder="Sélectionner un statut" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value='paid'>Payé</SelectItem>
                                                        <SelectItem value='pending'>En attente</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
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
                                        <ScrollArea className="flex-1 max-h-64 border rounded-md p-2">
                                            <div className="space-y-2">
                                                {products
                                                    .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                                                    /*.sort((a, b) => {
                                                        // Trier pour mettre en haut ceux qui sont sélectionnés
                                                        const aSelected = data.product_ids.includes(a.id) ? -1 : 1;
                                                        const bSelected = data.product_ids.includes(b.id) ? -1 : 1;
                                                        return aSelected - bSelected;
                                                    })*/
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
                                                                    <span className="text-xs text-muted-foreground">
                                                                        stock: {plural(product.quantity_in_stock, product.unity?.name)}
                                                                    </span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        P.U: {currencyFormatter(productPrices[product.id] ?? product.selling_price)}
                                                                    </span>
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
                                        </ScrollArea>

                                        <ScrollArea className="w-96 border max-h-64 rounded-md p-2">
                                            <div className="space-y-2">
                                                <p className="font-medium mb-2">Quantités / Prix</p>
                                                {data.product_ids.length === 0 && (
                                                    <p className="text-sm italic text-muted-foreground">Sélectionnez des produits.</p>
                                                )}
                                                {data.product_ids.map(productId => {
                                                    const product = products.find(p => p.id === productId);
                                                    return product ? (
                                                        <div key={productId} className="flex items-center gap-2">
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <span className="flex-1 truncate text-sm">{product.name}</span>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    {products.find(p => p.id == productId)?.unity.name}
                                                                </TooltipContent>
                                                            </Tooltip>
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
                                                            <Input
                                                                type="number"
                                                                step="1"
                                                                className="w-20 h-8 px-1 py-0 text-sm"
                                                                value={data.product_prices[productId]?.toFixed(0) ?? ''}
                                                                onChange={e => {
                                                                    const price = parseFloat(e.target.value);
                                                                    setData('product_prices', {
                                                                        ...data.product_prices,
                                                                        [productId]: isNaN(price) || price < 0 ? 0 : price
                                                                    });
                                                                }}
                                                            />
                                                        </div>
                                                    ) : null;
                                                })}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{data.product_ids.length} produit(s) sélectionné(s)</p>
                                </div>
                                <div className="flex justify-between items-end">
                                    <p className="text-md font-semibold">
                                        Total : {currencyFormatter(total)}
                                    </p>
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
                        console.log(order.products);
                        setData({
                            status: order.status ?? 'paid',
                            customer_id: order.customer ? String(order.customer.id) : '',
                            product_ids: order.products?.map(p => p.id) ?? [],
                            product_quantities: order.products?.reduce((acc, p) => {
                                acc[p.id] = p.pivot?.quantity ?? 1;
                                return acc;
                            }, {} as Record<number, number>) ?? {},
                            product_prices: order.products?.reduce((acc, p) => {
                                acc[p.id] = p.pivot?.price ?? 1;
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

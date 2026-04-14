"use client";

import { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    DollarSign,
    ShoppingCart,
    Search,
    User as UserIcon,
    CalendarX
} from 'lucide-react';

// Layout & Global Components
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Order, User } from '@/types';
import { currencyFormatter, handlePresetChange } from '@/lib/utils';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import OrdersTable from '../order/table';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * Props definition for the Customer Show page.
 */
interface CustomerShowProps {
    customer: User;
    orders: Order[];
    filters?: {
        from?: string;
        to?: string;
        preset?: string; // Permet de retenir le choix dans le menu déroulant
    }
}

export default function CustomerShow({ customer, orders, filters }: CustomerShowProps) {
    const isMobile = useIsMobile();
    // Local State
    const [globalFilter, setGlobalFilter] = useState<string>('');

    // Derived State: Memoized to prevent recalculation on search filter changes
    const totalAmount = useMemo(() => {
        return orders.reduce((sum, order) => sum + (Number(order.amount) || 0), 0);
    }, [orders]);

    const breadcrumbs = useMemo<BreadcrumbItem[]>(() => [
        { title: 'Tableau de bord', href: route('dashboard') },
        { title: 'Clients', href: route('customers.index') },
        { title: customer.name || 'Détails Client', href: '#' },
    ], [customer.name]);

    return (
        <AppLayout breadcrumbs={isMobile ? [] : breadcrumbs}>
            <Head title={`Client - ${customer.name || 'Détails'}`} />

            <div className="mx-auto w-full space-y-8 p-4 sm:p-6 lg:p-8">

                {/* --- Page Header --- */}
                <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <UserIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {customer.name}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Inscrit le {customer.created_at ? format(new Date(customer.created_at), 'dd/MM/yyyy') : 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Updated Preset Date Selector */}
                    <div className="w-full sm:w-[240px]">
                        <Select
                            value={filters?.preset || 'all'}
                            onValueChange={(value) => handlePresetChange(value, route('customers.show', customer.id))}
                        >
                            <SelectTrigger aria-label="Sélectionner la période">
                                <SelectValue placeholder="Filtrer par date" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes les dates</SelectItem>
                                <SelectItem value="today">Aujourd'hui</SelectItem>
                                <SelectItem value="yesterday">Hier</SelectItem>
                                <SelectItem value="this_week">Cette semaine</SelectItem>
                                <SelectItem value="last_week">La semaine dernière</SelectItem>
                                <SelectItem value="this_month">Ce mois</SelectItem>
                                <SelectItem value="last_month">Le mois dernier</SelectItem>
                                <SelectItem value="this_year">Cette année</SelectItem>
                                <SelectItem value="last_year">L'année dernière</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </header>

                {/* --- Key Performance Indicators (KPIs) --- */}
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6">
                    <Card className="shadow-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                Chiffre d'Affaires
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">
                                {currencyFormatter(totalAmount)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Généré sur la période sélectionnée
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                Total des Commandes
                            </CardTitle>
                            <ShoppingCart className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">
                                {orders.length}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Achats validés sur la période
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* --- Orders Data Table --- */}
                <Card className="shadow-none py-0">
                    <CardHeader className="p-4 sm:p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
                        <div>
                            <CardTitle className="text-lg">Historique des achats</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Liste détaillée de toutes les transactions du client.
                            </p>
                        </div>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher une transaction..."
                                value={globalFilter}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                className="w-full pl-9"
                                aria-label="Rechercher une transaction"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        {orders.length > 0 ? (
                            <OrdersTable
                                orders={orders as Order[]}
                                globalFilter={globalFilter}
                                setGlobalFilter={setGlobalFilter}
                                displayEdit={false}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="rounded-full bg-secondary p-3 mb-4">
                                    <CalendarX className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-medium text-foreground">Aucune commande trouvée</h3>
                                <p className="text-sm text-muted-foreground max-w-sm mt-1">
                                    Ce client n'a passé aucune commande dans la période sélectionnée ou correspondante à votre recherche.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

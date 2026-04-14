import * as React from "react"
import { Head, Link } from "@inertiajs/react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

import AppLayout from '@/layouts/app-layout'
import { Order, type BreadcrumbItem } from '@/types'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { currencyFormatter, handlePresetChange } from '@/lib/utils'
import { DollarSign, Users, CreditCard, Activity, TrendingUp, FileText, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tableau de bord', href: '/' },
]

interface PageProps {
    orders: Order[];
    filters?: {
        from?: string;
        to?: string;
        preset?: string; // Permet de retenir le choix dans le menu déroulant
    }
}

export default function Dashboard({ orders, filters }: PageProps) {
    const total_amount = React.useMemo(() => orders.reduce((carry, order) => carry + order.amount, 0), [orders]);
    const uniqueClientsCount = React.useMemo(() => new Set(orders.map(o => o.customer?.id).filter(Boolean)).size, [orders]);

    const recentOrders = orders.slice(0, 10);

    const paidOrders = orders.filter(order => order.status === 'paid');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tableau de bord" />

            <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Vue d'ensemble</h2>
                        <p className="text-sm text-muted-foreground">
                            Voici ce qui se passe dans votre boutique sur la période sélectionnée.
                        </p>
                    </div>

                    {/* Menu déroulant de sélection de période */}
                    <div className="flex items-center space-x-2">
                        <Select
                            defaultValue={filters?.preset || "all"}
                            onValueChange={(value) => handlePresetChange(value, route("dashboard"))}
                        >
                            <SelectTrigger className="w-[220px]">
                                <SelectValue placeholder="Sélectionnez une période" />
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
                </div>

                {/* --- Le reste du code (Grille des statistiques & Tableau) reste identique --- */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* Carte 1 : Chiffre d'affaires (Mise en valeur) */}
                    <Card className="relative overflow-hidden border-t-4 border-t-primary shadow-none hover:shadow-sm transition-all">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Chiffre d'affaires
                            </CardTitle>
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                                <DollarSign className="h-4 w-4 text-primary" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold tracking-tight">
                                {currencyFormatter(total_amount)}
                            </div>
                            <p className="mt-2 flex items-center text-xs text-muted-foreground">
                                {/* Exemple de tendance positive */}
                                <span className="flex items-center text-emerald-600 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded mr-2">
                                    <TrendingUp className="mr-1 h-3 w-3" />
                                    {paidOrders.length > 0 ? `${currencyFormatter(total_amount / paidOrders.length)}` : '0 FCFA'}
                                </span>
                                de revenu moyen par vente
                            </p>
                        </CardContent>
                    </Card>

                    {/* Carte 2 : Ventes */}
                    <Card className="shadow-none hover:shadow-sm transition-all">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Ventes validées
                            </CardTitle>
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10">
                                <CreditCard className="h-4 w-4 text-blue-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold tracking-tight">
                                {paidOrders.length}
                            </div>
                            <p className="mt-2 flex items-center text-xs text-muted-foreground">
                                <span className="flex items-center text-emerald-600 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded mr-2">
                                    <TrendingUp className="mr-1 h-3 w-3" />
                                    {orders.length > 0 ? `${((paidOrders.length / orders.length) * 100).toFixed(1)}%` : '0%'}
                                </span>
                                de vos ventes totales sont payées
                            </p>
                        </CardContent>
                    </Card>

                    {/* Carte 3 : Clients */}
                    <Card className="shadow-none hover:shadow-sm transition-all">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Clients uniques
                            </CardTitle>
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500/10">
                                <Users className="h-4 w-4 text-orange-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold tracking-tight">
                                {uniqueClientsCount}
                            </div>
                            <p className="mt-2 flex items-center text-xs text-muted-foreground">
                                {/* Exemple de tendance stable/neutre */}
                                <span className="flex items-center text-gray-600 dark:text-gray-400 font-medium bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded mr-2">
                                    <Activity className="mr-1 h-3 w-3" />
                                    Stable
                                </span>
                                sur cette période
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="shadow-none border-sidebar-border/70">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div className="grid gap-1">
                            <CardTitle>Dernières ventes</CardTitle>
                            <CardDescription>
                                Aperçu des {recentOrders.length} transactions les plus récentes.
                            </CardDescription>
                        </div>
                        <Button asChild variant="outline" size="sm" className="hidden sm:flex">
                            <Link href={route('orders.index')}> {/* Ajustez la route selon votre projet */}
                                Voir tout
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50 hover:bg-muted/50">
                                    <TableHead className="w-[120px]">Référence</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead className="hidden md:table-cell">Date</TableHead>
                                    <TableHead className="text-right">Montant</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentOrders.length > 0 ? (
                                    recentOrders.map((order) => {
                                        // Récupérer la première lettre du client pour l'avatar
                                        const initials = order.customer?.name
                                            ? order.customer.name.substring(0, 2).toUpperCase()
                                            : "IN";

                                        return (
                                            <TableRow key={order.id} className="group hover:bg-muted/30 transition-colors">
                                                {/* Référence (Police Mono pour faire plus technique/ID) */}
                                                <TableCell className="font-mono text-xs font-medium text-muted-foreground">
                                                    {order.reference}
                                                </TableCell>

                                                {/* Client avec Avatar */}
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                                                            {initials}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-foreground text-sm">
                                                                {order.customer ?
                                                                    <span>{order.customer.name}</span> :
                                                                    <span className="italic text-muted-foreground">Client invité</span>
                                                                }
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {order.products_count} {order.products_count > 1 ? 'articles' : 'article'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Statut (Badge) - À adapter selon vos vrais statuts */}
                                                <TableCell>
                                                    {order.status === 'paid' ? (
                                                        <Badge variant="default" className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-200 dark:border-emerald-800/30">
                                                            Payée
                                                        </Badge>
                                                    ) : order.status === 'pending' ? (
                                                        <Badge variant="secondary" className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border-amber-200 dark:border-amber-800/30">
                                                            En attente
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-muted-foreground">
                                                            {order.status || 'Validée'}
                                                        </Badge>
                                                    )}
                                                </TableCell>

                                                {/* Date (Cachée sur mobile pour aérer) */}
                                                <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                                                    {format(new Date(order.date), "dd MMM yyyy", { locale: fr })}
                                                </TableCell>

                                                {/* Montant */}
                                                <TableCell className="text-right font-semibold">
                                                    {currencyFormatter(order.amount)}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-48 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                                    <FileText className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium text-foreground">Aucune vente récente</p>
                                                    <p className="text-xs text-muted-foreground">Les transactions de cette période apparaîtront ici.</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}

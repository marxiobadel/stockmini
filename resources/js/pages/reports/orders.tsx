import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Order } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import AppLayout from '@/layouts/app-layout';
import { DateRange } from 'react-day-picker';

interface OrderReportProps {
    orders: Order[];
    filters: {
        start_date?: string;
        end_date?: string;
    };
    summary: {
        total_revenue: number;
        orders_count: number;
    }
}

export default function OrderReport({ orders, filters, summary }: OrderReportProps) {
    // 1. Utilisez <DateRange | undefined> au lieu de votre type inline
    const [date, setDate] = useState<DateRange | undefined>({
        from: filters.start_date ? new Date(filters.start_date) : undefined,
        to: filters.end_date ? new Date(filters.end_date) : undefined,
    });

    // 2. Utilisez DateRange ici aussi
    const applyDateFilter = (selectedDate: DateRange | undefined) => {
        setDate(selectedDate);

        if (selectedDate?.from && selectedDate?.to) {
            router.get(route('reports.orders'), {
                start_date: format(selectedDate.from, 'yyyy-MM-dd'),
                end_date: format(selectedDate.to, 'yyyy-MM-dd'),
            }, { preserveState: true, replace: true });
        }
    };

    // Fonction utilitaire pour la couleur des statuts
    const getStatusBadge = (status: Order['status']) => {
        switch (status) {
            case 'paid': return <Badge className="bg-green-600 hover:bg-green-700">Payé</Badge>;
            case 'partial': return <Badge variant="secondary" className="text-orange-600">Partiel</Badge>;
            case 'pending': return <Badge variant="destructive">En attente</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <AppLayout>
            <Head title="Rapport des Commandes" />
            <div className="space-y-6 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Rapport des Ventes</h2>
                        <p className="text-muted-foreground">Analyse des commandes par période.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-[260px] justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date?.from ? (
                                        date.to ? (
                                            <>
                                                {format(date.from, "dd/MM/yyyy")} - {format(date.to, "dd/MM/yyyy")}
                                            </>
                                        ) : (
                                            format(date.from, "dd/MM/yyyy")
                                        )
                                    ) : (
                                        <span>Filtrer par date</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={date?.from}
                                    selected={date}
                                    onSelect={applyDateFilter}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Chiffre d'Affaires</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.total_revenue.toLocaleString()} FCFA</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Nombre de Commandes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.orders_count}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Référence</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right">Montant</TableHead>
                                <TableHead className="text-right">Reste à payer</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                        Aucune commande pour cette période.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">{order.reference}</TableCell>
                                        <TableCell>{format(new Date(order.date), 'dd/MM/yyyy')}</TableCell>
                                        <TableCell>{order.customer?.name ?? 'Client standard'}</TableCell>
                                        <TableCell>
                                            {getStatusBadge(order.status)}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {order.amount.toLocaleString()} FCFA
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground">
                                            {order.remaining > 0 ? `${order.remaining.toLocaleString()} FCFA` : '-'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
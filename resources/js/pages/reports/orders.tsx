import { useState, useEffect } from 'react'; // Ajout de useEffect
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Order } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn, currencyFormatter } from '@/lib/utils';
import AppLayout from '@/layouts/app-layout';
import { DateRange } from 'react-day-picker';

interface OrderReportProps {
    orders: Order[];
    filters: {
        start_date?: string;
        end_date?: string;
    };
    summary: {
        total_paid: number;
        total_revenue: number;
        orders_count: number;
    }
}

export default function OrderReport({ orders, filters, summary }: OrderReportProps) {
    // --- ÉTATS POUR LE VERROUILLAGE ---
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [secretCode, setSecretCode] = useState('');
    const [error, setError] = useState('');

    const EXPECTED_CODE = '123456'; // Code à modifier selon vos besoins
    const STORAGE_KEY = 'order_report_unlock_expires';

    // Vérifier le localStorage au montage du composant
    useEffect(() => {
        const expirationTime = localStorage.getItem(STORAGE_KEY);
        
        if (expirationTime) {
            const now = new Date().getTime();
            // Si le temps actuel est inférieur au temps d'expiration
            if (now < parseInt(expirationTime, 10)) {
                setIsUnlocked(true);
            } else {
                // Le délai est dépassé, on nettoie le localStorage
                localStorage.removeItem(STORAGE_KEY);
            }
        }
    }, []);

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        if (secretCode === EXPECTED_CODE) {
            setIsUnlocked(true);
            setError('');
            
            // Sauvegarder la date d'expiration (Heure actuelle + 1 heure en millisecondes)
            const oneHour = 60 * 60 * 1000;
            const expiresAt = new Date().getTime() + oneHour;
            localStorage.setItem(STORAGE_KEY, expiresAt.toString());
        } else {
            setError('Code secret incorrect. Veuillez réessayer.');
            setSecretCode('');
        }
    };

    const handleGoBack = () => {
        window.history.back();
    };
    // ----------------------------------

    const [date, setDate] = useState<DateRange | undefined>({
        from: filters.start_date ? new Date(filters.start_date) : undefined,
        to: filters.end_date ? new Date(filters.end_date) : undefined,
    });

    const applyDateFilter = (selectedDate: DateRange | undefined) => {
        setDate(selectedDate);

        if (selectedDate?.from && selectedDate?.to) {
            router.get(route('reports.orders'), {
                start_date: format(selectedDate.from, 'yyyy-MM-dd'),
                end_date: format(selectedDate.to, 'yyyy-MM-dd'),
            }, { preserveState: true, replace: true });
        }
    };

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

            {/* Popup (Overlay) demandant le code secret */}
            {!isUnlocked && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
                    <Card className="w-full max-w-md shadow-lg border-2">
                        <CardHeader>
                            <CardTitle className="text-center text-xl">Accès Restreint</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground text-center mb-6">
                                Veuillez entrer le code secret pour consulter le rapport des ventes.
                            </p>
                            <form onSubmit={handleUnlock} className="space-y-4">
                                <div className="space-y-2">
                                    <Input
                                        type="password"
                                        placeholder="Code secret..."
                                        value={secretCode}
                                        onChange={(e) => setSecretCode(e.target.value)}
                                        className={error ? 'border-destructive' : ''}
                                        autoFocus
                                    />
                                    {error && (
                                        <p className="text-sm font-medium text-destructive">{error}</p>
                                    )}
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        className="w-full" 
                                        onClick={handleGoBack}
                                    >
                                        Retour
                                    </Button>
                                    <Button type="submit" className="w-full">
                                        Déverrouiller
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Contenu principal de la page flouté/désactivé si verrouillé */}
            <div className={`space-y-6 p-6 transition-all duration-300 ${!isUnlocked ? 'pointer-events-none opacity-20 blur-sm select-none' : ''}`}>
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
                                    autoFocus={false}
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

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="shadow-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Chiffre d'Affaires</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{currencyFormatter(summary.total_revenue)}</div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total payé</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{currencyFormatter(summary.total_paid)}</div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-none">
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
                                            {currencyFormatter(order.amount)}
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground">
                                            {order.remaining > 0 ? currencyFormatter(order.remaining) : '-'}
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
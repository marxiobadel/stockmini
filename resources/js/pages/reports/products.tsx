import { Category, Product } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import React, { useState, useEffect } from 'react'; // Ajout de useEffect
import { currencyFormatter, plural } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CategoryWithProducts extends Category {
    products: Product[];
}

interface ProductReportProps {
    categories: CategoryWithProducts[];
}

export default function ProductReport({ categories }: ProductReportProps) {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [secretCode, setSecretCode] = useState('');
    const [error, setError] = useState('');

    const EXPECTED_CODE = '123456';
    const STORAGE_KEY = 'product_report_unlock_expires'; // Clé locale spécifique pour cette page

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

    // Fonction pour revenir à la page précédente
    const handleGoBack = () => {
        window.history.back();
    };

    const totalInventoryValue = categories.reduce((total, category) => {
        const categoryValue = category.products.reduce((catTotal, product) => {
            const stock = product.quantity_in_stock ?? 0;
            const price = product.purchasing_price ?? 0;
            return catTotal + (stock * price);
        }, 0);
        return total + categoryValue;
    }, 0);

    return (
        <AppLayout>
            <Head title="Catégorie de produits" />
            
            {/* Popup (Overlay) demandant le code secret */}
            {!isUnlocked && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
                    <Card className="w-full max-w-md shadow-lg border-2">
                        <CardHeader>
                            <CardTitle className="text-center text-xl">Accès Restreint</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground text-center mb-6">
                                Veuillez entrer le code secret pour consulter ce rapport d'inventaire.
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
                                {/* Boutons : Retour et Déverrouiller */}
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

            {/* Contenu principal de la page */}
            <div className={`space-y-6 p-6 transition-all duration-300 ${!isUnlocked ? 'pointer-events-none opacity-20 blur-sm select-none' : ''}`}>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Rapport d'Inventaire</h2>
                    <p className="text-muted-foreground">Analyse des produits classés par catégorie.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="shadow-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Catégories</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{categories.length}</div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Valeur Totale en Stock</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">
                                {currencyFormatter(totalInventoryValue)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Produit</TableHead>
                                <TableHead>Catégorie</TableHead>
                                <TableHead className="text-right">Stock Actuel</TableHead>
                                <TableHead className="text-right">Prix d'Achat</TableHead>
                                <TableHead className="text-right">Prix de Vente</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((category) => (
                                <React.Fragment key={`cat-${category.id}`}>
                                    <TableRow className="bg-muted/50">
                                        <TableCell colSpan={5} className="font-semibold text-primary">
                                            {category.name} ({category.products.length} produits)
                                        </TableCell>
                                    </TableRow>

                                    {category.products.map((product) => {
                                        const stock = product.quantity_in_stock ?? 0;
                                        const price = product.selling_price ?? 0;

                                        return (
                                            <TableRow key={product.id}>
                                                <TableCell>
                                                    <div className="font-medium">{product.name}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{category.name}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Badge
                                                        variant={stock > (product.threshold_alert ?? 0) ? 'default' : 'destructive'}
                                                    >
                                                        {plural(stock, product.unity?.name || "unité")}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">{currencyFormatter(product.purchasing_price ?? 0)}</TableCell>
                                                <TableCell className="text-right">{currencyFormatter(price)}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
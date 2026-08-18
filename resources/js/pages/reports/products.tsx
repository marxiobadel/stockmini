import { Category, Product } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import React, { useState } from 'react';
import { currencyFormatter, plural } from '@/lib/utils';
// Assurez-vous d'avoir ces composants ou remplacez-les par des balises HTML standards
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CategoryWithProducts extends Category {
    products: Product[];
}

interface ProductReportProps {
    categories: CategoryWithProducts[];
}

export default function ProductReport({ categories }: ProductReportProps) {
    // État pour gérer le verrouillage, la saisie et les erreurs
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [secretCode, setSecretCode] = useState('');
    const [error, setError] = useState('');

    // Le code secret attendu (à modifier selon vos besoins)
    const EXPECTED_CODE = '123456';

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        if (secretCode === EXPECTED_CODE) {
            setIsUnlocked(true);
            setError('');
        } else {
            setError('Code secret incorrect. Veuillez réessayer.');
            setSecretCode('');
        }
    };

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
                                <Button type="submit" className="w-full">
                                    Déverrouiller
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Contenu principal de la page (flouté et désactivé si non déverrouillé) */}
            <div className={`space-y-6 p-6 transition-all duration-300 ${!isUnlocked ? 'pointer-events-none opacity-20 blur-sm select-none' : ''}`}>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Rapport d'Inventaire</h2>
                    <p className="text-muted-foreground">Analyse des produits classés par catégorie.</p>
                </div>

                {/* Cartes de résumé */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="shadow-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Catégories</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{categories.length}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tableau classifié par catégories */}
                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Produit</TableHead>
                                <TableHead>Catégorie</TableHead>
                                <TableHead className="text-right">Stock Actuel</TableHead>
                                <TableHead className="text-right">Prix de Vente</TableHead>
                                <TableHead className="text-right">Valeur Totale</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((category) => (
                                <React.Fragment key={`cat-${category.id}`}>
                                    {/* En-tête de séparation pour la catégorie */}
                                    <TableRow className="bg-muted/50">
                                        <TableCell colSpan={5} className="font-semibold text-primary">
                                            {category.name} ({category.products.length} produits)
                                        </TableCell>
                                    </TableRow>

                                    {/* Liste des produits de cette catégorie */}
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
                                                <TableCell className="text-right">{currencyFormatter(price)}</TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {currencyFormatter(price * stock)}
                                                </TableCell>
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
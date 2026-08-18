import { Category, Product } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import React from 'react';
import { currencyFormatter, plural } from '@/lib/utils';

// On étend la catégorie pour inclure la relation des produits chargés depuis le backend
interface CategoryWithProducts extends Category {
    products: Product[];
}

interface ProductReportProps {
    categories: CategoryWithProducts[];
}

export default function ProductReport({ categories }: ProductReportProps) {
    return (
        <AppLayout>
            <Head title="Catégorie de produits" />
            <div className="space-y-6 p-6">
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
                                        // On sécurise la récupération du stock en vérifiant les deux champs
                                        const stock = product.quantity_in_stock ?? 0;
                                        // On s'assure d'avoir un prix par défaut pour éviter les erreurs de calcul NaN
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
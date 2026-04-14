import AppLayout from "@/layouts/app-layout";
import { currencyFormatter } from "@/lib/utils";
import { BreadcrumbItem, Product, SpecificPrice, User } from "@/types";
import { Head, router } from "@inertiajs/react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CalendarIcon, Plus, Trash2, X, Package, Tag, Save, AlertCircle } from "lucide-react";
import { CustomersComboBox } from "@/components/customers-combobox";
import { useEffect } from "react";
import { toast } from "sonner";

interface PageProps {
    product: Product;
    customers: User[];
    errors: Record<string, string>;
}

interface FormValues {
    specific_prices: SpecificPrice[];
}

export default function Show({ product, customers, errors }: PageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Tableau de bord", href: route("dashboard") },
        { title: "Produits", href: route("products.index") },
        { title: `Produit #${product.id}`, href: '#' },
    ];

    const isLowStock = product.quantity_in_stock <= product.threshold_alert;

    const defaultSpecificPrices = (product.specific_prices || []).map((sp) => ({
        id: sp.id,
        start_date: sp.start_date ? new Date(sp.start_date) : null,
        end_date: sp.end_date ? new Date(sp.end_date) : null,
        reduction_type: sp.reduction_type || "percent",
        reduction_value: sp.reduction_value === null || sp.reduction_value === undefined ? "" : sp.reduction_value,
        from_quantity: sp.from_quantity || 1,
        customer_ids: sp.customer_ids || [],
    }));

    const { control, handleSubmit, setError, clearErrors, formState: { isSubmitting } } = useForm<FormValues>({
        defaultValues: {
            specific_prices: defaultSpecificPrices.length > 0
                ? defaultSpecificPrices
                : [
                    {
                        start_date: new Date(),
                        end_date: null,
                        reduction_type: "percent",
                        reduction_value: "",
                        from_quantity: 1,
                        customer_ids: [] as number[],
                    },
                ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "specific_prices",
    });

    useEffect(() => {
        if (errors) {
            Object.entries(errors).forEach(([key, message]) => {
                if (key.startsWith("specific_prices")) {
                    setError(key as any, { type: "server", message });
                }
            });
        } else {
            clearErrors();
        }
    }, [errors, setError, clearErrors]);

    const onSubmit = (data: FormValues) => {
        const payload = {
            specific_prices: data.specific_prices.map((sp) => ({
                id: sp.id,
                start_date: sp.start_date,
                end_date: sp.end_date,
                reduction_type: sp.reduction_type,
                reduction_value: sp.reduction_value === "" ? null : Number(sp.reduction_value),
                from_quantity: Number(sp.from_quantity),
                customer_ids: sp.customer_ids,
            })),
        };

        router.post(route("products.specific-prices.store", product.id), payload, {
            onSuccess() {
                clearErrors();
                toast.success('Succès !', { description: 'Prix spécifiques enregistrés avec succès.' })
            },
        });
    };

    function toDate(value: Date | string | null) {
        if (!value) return null;
        return value instanceof Date ? value : new Date(value);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={product.name} />

            <div className="space-y-6 max-w-7xl mx-auto pb-10 mt-10">
                {/* Carte Produit */}
                <Card className="shadow-none pb-4 pt-0 mx-4 sm:mx-0">
                    <CardHeader className="p-4 sm:p-6 flex flex-row items-start justify-between bg-muted/30">
                        <div>
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <Package className="h-6 w-6 text-muted-foreground" />
                                {product.name}
                            </CardTitle>
                            <CardDescription className="mt-1.5">
                                Référence #{product.id}
                            </CardDescription>
                        </div>
                        {isLowStock && (
                            <Badge variant="destructive" className="flex items-center gap-1.5 px-3 py-1 text-sm">
                                <AlertCircle className="h-4 w-4" />
                                Stock bas
                            </Badge>
                        )}
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6 pt-4">
                        <div className="space-y-8">
                            {product.description && (
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">Description</h3>
                                    <p className="text-sm text-foreground leading-relaxed bg-muted/30 p-4 rounded-md">
                                        {product.description}
                                    </p>
                                </div>
                            )}

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
                                    <Tag className="h-4 w-4" />
                                    Informations de stock et tarification
                                </h3>
                                <dl className="grid grid-cols-2 lg:grid-cols-4 gap-6 bg-muted/20 p-5 rounded-lg border border-border/50">
                                    <div className="space-y-1">
                                        <dt className="text-sm font-medium text-muted-foreground">Catégorie</dt>
                                        <dd className="text-sm font-semibold">{product.category?.name || "—"}</dd>
                                    </div>
                                    <div className="space-y-1">
                                        <dt className="text-sm font-medium text-muted-foreground">Unité</dt>
                                        <dd className="text-sm font-semibold">{product.unity?.name || "—"}</dd>
                                    </div>
                                    <div className="space-y-1">
                                        <dt className="text-sm font-medium text-muted-foreground">Quantité en stock</dt>
                                        <dd className={cn("text-sm font-semibold", isLowStock && "text-destructive")}>
                                            {product.quantity_in_stock} <span className="text-muted-foreground font-normal text-xs">(Seuil: {product.threshold_alert})</span>
                                        </dd>
                                    </div>
                                    <div className="space-y-1">
                                        <dt className="text-sm font-medium text-muted-foreground">Prix de vente</dt>
                                        <dd className="text-sm font-semibold text-primary">{currencyFormatter(product.selling_price)}</dd>
                                    </div>
                                    {product.purchasing_price !== null && (
                                        <div className="space-y-1">
                                            <dt className="text-sm font-medium text-muted-foreground">Prix d'achat</dt>
                                            <dd className="text-sm font-semibold">{currencyFormatter(product.purchasing_price)}</dd>
                                        </div>
                                    )}
                                </dl>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Formulaire des prix spécifiques */}
                <Card className="shadow-none mx-4 sm:mx-0">
                    <CardHeader className="px-4 sm:px-6">
                        <CardTitle>Prix spécifiques</CardTitle>
                        <CardDescription>
                            Configurez des réductions personnalisées selon les dates, les quantités ou pour des clients spécifiques.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-6">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="relative rounded-xl border bg-card text-card-foreground p-4 sm:p-6 transition-all">

                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-sm font-semibold text-primary">Règle de prix #{index + 1}</h4>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 px-2"
                                                onClick={() => remove(index)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-1.5" /> Supprimer
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            {/* Date début */}
                                            <div className="space-y-2">
                                                <Label htmlFor={`start_date_${index}`}>Date de début <span className="text-destructive">*</span></Label>
                                                <Controller
                                                    control={control}
                                                    name={`specific_prices.${index}.start_date`}
                                                    render={({ field: f, fieldState }) => (
                                                        <div>
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <Button
                                                                        id={`start_date_${index}`}
                                                                        variant="outline"
                                                                        className={cn("mt-1 w-full justify-start text-left font-normal", !f.value && "text-muted-foreground", fieldState.error && "border-destructive")}
                                                                    >
                                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                                        {f.value ? format(toDate(f.value)!, "dd MMMM yyyy", { locale: fr }) : "Sélectionner une date"}
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto p-0">
                                                                    <Calendar locale={fr} mode="single" selected={toDate(f.value) ?? undefined} onSelect={f.onChange} initialFocus />
                                                                </PopoverContent>
                                                            </Popover>
                                                            {fieldState.error && <p className="mt-1.5 text-xs text-destructive">{fieldState.error.message}</p>}
                                                        </div>
                                                    )}
                                                />
                                            </div>

                                            {/* Date fin */}
                                            <div className="space-y-2">
                                                <Label htmlFor={`end_date_${index}`}>Date de fin (optionnelle)</Label>
                                                <Controller
                                                    control={control}
                                                    name={`specific_prices.${index}.end_date`}
                                                    render={({ field: f, fieldState }) => (
                                                        <div>
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <Button
                                                                        id={`end_date_${index}`}
                                                                        variant="outline"
                                                                        className={cn("mt-1 w-full justify-start text-left font-normal", !f.value && "text-muted-foreground", fieldState.error && "border-destructive")}
                                                                    >
                                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                                        {f.value ? format(toDate(f.value)!, "dd MMMM yyyy", { locale: fr }) : "Sélectionner une date"}
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto p-3 space-y-3">
                                                                    <Calendar locale={fr} mode="single" selected={toDate(f.value) ?? undefined} onSelect={(date) => f.onChange(date ?? null)} initialFocus />
                                                                    {f.value && (
                                                                        <Button type="button" variant="destructive" size="sm" className="w-full" onClick={() => f.onChange(null)}>
                                                                            <X className="h-4 w-4 mr-2" /> Effacer la date
                                                                        </Button>
                                                                    )}
                                                                </PopoverContent>
                                                            </Popover>
                                                            {fieldState.error && <p className="mt-1.5 text-xs text-destructive">{fieldState.error.message}</p>}
                                                        </div>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                            {/* Type de réduction */}
                                            <div className="space-y-2">
                                                <Label htmlFor={`reduction_type_${index}`}>Type de réduction <span className="text-destructive">*</span></Label>
                                                <Controller
                                                    control={control}
                                                    name={`specific_prices.${index}.reduction_type`}
                                                    render={({ field }) => (
                                                        <Select value={field.value} onValueChange={field.onChange}>
                                                            <SelectTrigger id={`reduction_type_${index}`} className="mt-1">
                                                                <SelectValue placeholder="Type" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="percent">Pourcentage (%)</SelectItem>
                                                                <SelectItem value="amount">Montant fixe</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                            </div>

                                            {/* Valeur */}
                                            <div className="space-y-2">
                                                <Label htmlFor={`reduction_value_${index}`}>Valeur <span className="text-destructive">*</span></Label>
                                                <Controller
                                                    control={control}
                                                    name={`specific_prices.${index}.reduction_value`}
                                                    render={({ field: f, fieldState }) => (
                                                        <div>
                                                            <Input id={`reduction_value_${index}`} type="number" step="0.01" placeholder="Ex: 10" {...f} className={cn("mt-1", {"border-destructive focus-visible:ring-destructive": fieldState.error})} />
                                                            {fieldState.error && <p className="mt-1.5 text-xs text-destructive">{fieldState.error.message}</p>}
                                                        </div>
                                                    )}
                                                />
                                            </div>

                                            {/* Quantité minimale */}
                                            <div className="space-y-2">
                                                <Label htmlFor={`from_quantity_${index}`}>À partir de (Quantité) <span className="text-destructive">*</span></Label>
                                                <Controller
                                                    control={control}
                                                    name={`specific_prices.${index}.from_quantity`}
                                                    render={({ field: f, fieldState }) => (
                                                        <div>
                                                            <Input id={`from_quantity_${index}`} type="number" placeholder="Ex: 5" {...f} className={cn('mt-1', {"border-destructive focus-visible:ring-destructive": fieldState.error})} />
                                                            {fieldState.error && <p className="mt-1.5 text-xs text-destructive">{fieldState.error.message}</p>}
                                                        </div>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        {/* Clients */}
                                        <div className="space-y-2">
                                            <Label>Appliquer à des clients spécifiques (Laisser vide pour tous)</Label>
                                            <Controller
                                                control={control}
                                                name={`specific_prices.${index}.customer_ids`}
                                                render={({ field }) => (
                                                    <CustomersComboBox
                                                        options={customers.map((c) => ({ value: c.id, label: c.name }))}
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        placeholder="Rechercher des clients..."
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>
                                ))}

                                {fields.length === 0 && (
                                    <div className="text-center p-8 border-2 border-dashed rounded-xl bg-muted/10">
                                        <Tag className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
                                        <p className="text-sm text-muted-foreground">Aucune règle de prix spécifique définie.</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => append({ start_date: new Date(), end_date: null, reduction_type: "percent", reduction_value: "", from_quantity: 1, customer_ids: [] })}
                                    className="w-full sm:w-auto"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Ajouter une règle de prix
                                </Button>

                                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-2">Traitement en cours...</span>
                                    ) : (
                                        <span className="flex items-center gap-2"><Save className="h-4 w-4" /> Enregistrer les prix</span>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

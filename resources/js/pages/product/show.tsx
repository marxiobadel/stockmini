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
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CalendarIcon, Plus, Trash2, X } from "lucide-react";
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
        reduction_value:
            sp.reduction_value === null || sp.reduction_value === undefined
                ? ""
                : sp.reduction_value,
        from_quantity: sp.from_quantity || 1,
        customer_ids: sp.customer_ids || [],
    }));

    // Initial default values avec gestion des dates nullables
    const { control, handleSubmit, setError, clearErrors, formState: isSubmitting } = useForm<FormValues>({
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

    // Gestion affichage erreurs Laravel côté client
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
                reduction_value:
                    sp.reduction_value === "" ? null : Number(sp.reduction_value),
                from_quantity: Number(sp.from_quantity),
                customer_ids: sp.customer_ids,
            })),
        };

        router.post(route("products.specific-prices.store", product.id), payload, {
            onSuccess() {
                clearErrors();
                toast.success('Succès !', { description: 'Prix spécifiques enregistrés.' })
            },
        });
    };

    // Convertir valeur date en objet Date (ou null)
    function toDate(value: Date | string | null) {
        if (!value) return null;
        return value instanceof Date ? value : new Date(value);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={product.name} />

            {/* Carte produit */}
            <div className="bg-white rounded-xl overflow-hidden mb-8">
                <div className="bg-gray-50 px-6 py-5 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">{product.name}</h1>
                        <p className="text-sm text-gray-500">Référence #{product.id}</p>
                    </div>
                    {isLowStock && (
                        <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                            Stock bas
                        </span>
                    )}
                </div>

                <div className="p-6 space-y-6">
                    {product.description && (
                        <div>
                            <h2 className="text-lg font-medium text-gray-800 mb-2">Description</h2>
                            <p className="text-gray-600 leading-relaxed">{product.description}</p>
                        </div>
                    )}

                    <div>
                        <h2 className="text-lg font-medium text-gray-800 mb-4">Informations</h2>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Catégorie</dt>
                                <dd className="text-gray-900">{product.category?.name}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Unité</dt>
                                <dd className="text-gray-900">{product.unity?.name}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Quantité en stock</dt>
                                <dd className={`font-semibold ${isLowStock ? "text-red-600" : "text-gray-900"}`}>
                                    {product.quantity_in_stock}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Seuil d'alerte</dt>
                                <dd className="text-gray-900">{product.threshold_alert}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Prix de vente</dt>
                                <dd className="text-gray-900">{currencyFormatter(product.selling_price)}</dd>
                            </div>
                            {product.purchasing_price !== null && (
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Prix d'achat</dt>
                                    <dd className="text-gray-900">{currencyFormatter(product.purchasing_price)}</dd>
                                </div>
                            )}
                        </dl>
                    </div>
                </div>
            </div>

            {/* Formulaire des prix spécifiques */}
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl p-6 space-y-6">
                <h2 className="text-lg font-medium text-gray-800">Prix spécifiques</h2>

                {fields.map((field, index) => (
                    <div key={field.id} className="border p-5 rounded-lg shadow-sm bg-gray-50 space-y-4 relative">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Date début */}
                            <Controller
                                control={control}
                                name={`specific_prices.${index}.start_date`}
                                render={({ field: f, fieldState }) => (
                                    <div>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !f.value && "text-muted-foreground",
                                                        fieldState.error && "border-red-600 focus:ring-red-600"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {f.value
                                                        ? format(toDate(f.value)!, "dd MMMM yyyy", { locale: fr })
                                                        : "Date de début"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    locale={fr}
                                                    mode="single"
                                                    selected={toDate(f.value) ?? undefined}
                                                    onSelect={f.onChange}
                                                    autoFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {fieldState.error && (
                                            <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
                                        )}
                                    </div>
                                )}
                            />

                            {/* Date fin */}
                            <Controller
                                control={control}
                                name={`specific_prices.${index}.end_date`}
                                render={({ field: f, fieldState }) => (
                                    <div>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !f.value && "text-muted-foreground",
                                                        fieldState.error && "border-red-600 focus:ring-red-600"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {f.value
                                                        ? format(toDate(f.value)!, "dd MMMM yyyy", { locale: fr })
                                                        : "Date de fin (optionnelle)"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-3 space-y-3">
                                                <Calendar
                                                    locale={fr}
                                                    mode="single"
                                                    selected={toDate(f.value) ?? undefined}
                                                    onSelect={(date) => f.onChange(date ?? null)}
                                                    autoFocus
                                                />
                                                {f.value && (
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        className="w-full flex items-center gap-2"
                                                        onClick={() => f.onChange(null)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                        Effacer la date
                                                    </Button>
                                                )}
                                            </PopoverContent>
                                        </Popover>
                                        {fieldState.error && (
                                            <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
                                        )}
                                    </div>
                                )}
                            />

                            {/* Type de réduction */}
                            <Controller
                                control={control}
                                name={`specific_prices.${index}.reduction_type`}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Type de réduction" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="percent">Pourcentage</SelectItem>
                                            <SelectItem value="amount">Montant fixe</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />

                            {/* Valeur */}
                            <Controller
                                control={control}
                                name={`specific_prices.${index}.reduction_value`}
                                render={({ field: f, fieldState }) => (
                                    <div>
                                        <Input
                                            type="number"
                                            placeholder="Valeur"
                                            {...f}
                                            className={cn(fieldState.error ? "border-red-600 focus:ring-red-600" : "")}
                                        />
                                        {fieldState.error && (
                                            <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
                                        )}
                                    </div>
                                )}
                            />

                            {/* Quantité minimale */}
                            <Controller
                                control={control}
                                name={`specific_prices.${index}.from_quantity`}
                                render={({ field: f, fieldState }) => (
                                    <div>
                                        <Input
                                            type="number"
                                            placeholder="Quantité minimale"
                                            {...f}
                                            className={cn(fieldState.error ? "border-red-600 focus:ring-red-600" : "")}
                                        />
                                        {fieldState.error && (
                                            <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
                                        )}
                                    </div>
                                )}
                            />

                            {/* Clients */}
                            <Controller
                                control={control}
                                name={`specific_prices.${index}.customer_ids`}
                                render={({ field }) => (
                                    <CustomersComboBox
                                        options={customers.map((c) => ({ value: c.id, label: c.name }))}
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Sélectionner des clients"
                                    />
                                )}
                            />
                        </div>

                        {/* Bouton supprimer */}
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => remove(index)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}

                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() =>
                            append({
                                start_date: null,
                                end_date: null,
                                reduction_type: "percent",
                                reduction_value: "",
                                from_quantity: 1,
                                customer_ids: [],
                            })
                        }
                    >
                        <Plus className="mr-2 h-4 w-4" /> Ajouter une ligne
                    </Button>
                    <Button type="submit">Enregistrer</Button>
                </div>
            </form>
        </AppLayout>
    );
}

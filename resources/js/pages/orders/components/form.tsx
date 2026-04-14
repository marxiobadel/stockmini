"use client";

import React from "react";
import { useForm } from "@inertiajs/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2Icon } from "lucide-react";
import { currencyFormatter, plural } from "@/lib/utils";
import { type Product, type User, type Order } from "@/types";

interface Props {
    order?: Order;
    products: Product[];
    customers: User[];
    onSuccess?: () => void;
}

export default function OrderForm({
    order,
    products,
    customers,
    onSuccess,
}: Props) {
    const isEditMode = !!order;

    const { data, setData, post, put, processing } = useForm<{
        status: string;
        customer_id?: string;
        product_ids: number[];
        product_quantities: Record<number, number>;
        product_prices: Record<number, number>;
        payments: { amount: number; payment_date?: string; status: string }[];
    }>({
        status: order?.status ?? "paid",
        customer_id: order?.customer ? String(order.customer.id) : "",
        product_ids: order?.products?.map((p) => p.id) ?? [],
        product_quantities:
            order?.products?.reduce((acc, p) => {
                acc[p.id] = p.pivot?.quantity ?? 1;
                return acc;
            }, {} as Record<number, number>) ?? {},
        product_prices:
            order?.products?.reduce((acc, p) => {
                acc[p.id] = p.pivot?.price ?? 0;
                return acc;
            }, {} as Record<number, number>) ?? {},
        payments: order?.payments ?? [],
    });

    const [productSearch, setProductSearch] = React.useState("");

    const total = React.useMemo(() => {
        return data.product_ids.reduce((sum, id) => {
            const qty = data.product_quantities[id] ?? 1;
            const price =
                data.product_prices[id] ??
                products.find((p) => p.id === id)?.selling_price ??
                0;
            return sum + qty * price;
        }, 0);
    }, [data, products]);

    const totalPaid = React.useMemo(() => {
        return data.payments
            .filter((p) => p.status === "paid")
            .reduce((sum, p) => sum + (p.amount || 0), 0);
    }, [data.payments]);

    /** Fractionner le paiement en N fois **/
    const handleSplitPayments = (count: number) => {
        if (count <= 0 || total <= 0) return;
        const part = parseFloat((total / count).toFixed(2));
        const today = new Date();
        const schedule = Array.from({ length: count }).map((_, i) => ({
            amount: part,
            payment_date: new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate() + i * 30
            )
                .toISOString()
                .split("T")[0],
            status: i === 0 ? "paid" : "pending",
        }));
        setData("payments", schedule);
    };

    /** Ajouter un paiement manuel **/
    const handleAddPayment = () => {
        // Obtenir la date du jour au format YYYY-MM-DD
        const today = new Date().toISOString().split("T")[0];

        setData("payments", [
            ...data.payments,
            { amount: 0, payment_date: today, status: "paid" },
        ]);
    };

    /** Supprimer un paiement **/
    const handleRemovePayment = (index: number) => {
        setData(
            "payments",
            data.payments.filter((_, i) => i !== index)
        );
    };

    /** Soumission **/
    const handleSubmit = () => {
        const totalPaid = data.payments
            .filter((p) => p.status === "paid")
            .reduce((s, p) => s + p.amount, 0);
        let status = "pending";
        if (totalPaid >= total) status = "paid";
        else if (totalPaid > 0) status = "partial";
        setData("status", status);

        isEditMode
            ? put(route("orders.update", order!.id), {
                  onSuccess: () => {
                      toast("Vente modifiée avec succès");
                      onSuccess?.();
                  },
                  onError: (errors) => {
                      toast.error("Erreur lors de la modification", {
                          description: Object.values(errors).join(", "),
                      });
                  },
              })
            : post(route("orders.store"), {
                  onSuccess: () => {
                      toast("Vente enregistrée avec succès");
                      onSuccess?.();
                  },
                  onError: (errors) => {
                      toast.error("Erreur lors de l'ajout", {
                          description: Object.values(errors).join(", "),
                          duration: 10000,
                      });
                  },
              });
    };

    return (
        <>
            <div className="space-y-6">
                {/* --- CLIENT + STATUT --- */}
                {/* Made flex-col on mobile, flex-row on md+ screens */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-1/2 space-y-1">
                        <Label htmlFor="customer_id">Client</Label>
                        <div className="flex items-center gap-2">
                            <Select
                                value={data.customer_id}
                                onValueChange={(value) => setData("customer_id", value)}
                            >
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Sélectionner un client" />
                                </SelectTrigger>
                                <SelectContent>
                                    {customers.map((customer) => (
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
                                    onClick={() => setData("customer_id", "")}
                                >
                                    ✕
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="w-full md:w-1/2 space-y-1">
                        <Label htmlFor="status">Statut</Label>
                        <Select
                            value={data.status}
                            onValueChange={(v) => setData("status", v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="paid">Payé</SelectItem>
                                <SelectItem value="pending">En attente</SelectItem>
                                <SelectItem value="partial">Partiel</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* --- PRODUITS --- */}
                <div className="space-y-1">
                    <Label htmlFor="product_search">Rechercher un produit</Label>
                    <Input
                        id="product_search"
                        placeholder="Tapez le nom du produit..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                    />
                </div>

                {/* Made flex-col on mobile, flex-row on md+ screens */}
                <div className="flex flex-col md:flex-row gap-4">
                    <ScrollArea className="w-full md:flex-1 max-h-64 border rounded-md p-2">
                        {products
                            .filter((p) =>
                                p.name.toLowerCase().includes(productSearch.toLowerCase())
                            )
                            .map((product) => {
                                const selected = data.product_ids.includes(product.id);
                                return (
                                    <label
                                        key={product.id}
                                        className="flex items-center gap-2 cursor-pointer mb-2 last:mb-0"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selected}
                                            onChange={() => {
                                                if (selected) {
                                                    setData({
                                                        ...data,
                                                        product_ids: data.product_ids.filter(
                                                            (id) => id !== product.id
                                                        ),
                                                    });
                                                } else {
                                                    setData({
                                                        ...data,
                                                        product_ids: [...data.product_ids, product.id],
                                                        product_quantities: {
                                                            ...data.product_quantities,
                                                            [product.id]: 1,
                                                        },
                                                        product_prices: {
                                                            ...data.product_prices,
                                                            [product.id]: product.selling_price,
                                                        },
                                                    });
                                                }
                                            }}
                                        />
                                        <div>
                                            <p className="font-medium">{product.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Stock: {plural(product.quantity_in_stock, product.unity?.name)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                P.U: {currencyFormatter(product.selling_price)}
                                            </p>
                                        </div>
                                    </label>
                                );
                            })}
                    </ScrollArea>

                    <ScrollArea className="w-full md:w-96 border max-h-64 rounded-md p-2">
                        <p className="font-medium mb-2">Quantités / Prix</p>
                        {data.product_ids.map((id) => {
                            const product = products.find((p) => p.id === id);
                            return (
                                <div key={id} className="flex items-center gap-2 mb-2 last:mb-0">
                                    <span className="flex-1 truncate text-sm">
                                        {product?.name}
                                    </span>
                                    <Input
                                        type="number"
                                        min="1"
                                        className="w-16 h-8 px-1 py-0 text-sm"
                                        value={data.product_quantities[id] ?? 1}
                                        onChange={(e) =>
                                            setData("product_quantities", {
                                                ...data.product_quantities,
                                                [id]: parseInt(e.target.value) || 1,
                                            })
                                        }
                                    />
                                    <Input
                                        type="number"
                                        step="0.01"
                                        className="w-20 h-8 px-1 py-0 text-sm"
                                        value={data.product_prices[id]?.toFixed(0) ?? ""}
                                        onChange={(e) =>
                                            setData("product_prices", {
                                                ...data.product_prices,
                                                [id]: parseFloat(e.target.value) || 0,
                                            })
                                        }
                                    />
                                </div>
                            );
                        })}
                    </ScrollArea>
                </div>

                {/* --- SECTION PAIEMENTS MULTIPLES --- */}
                <div className="border rounded-md p-4 mt-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <h3 className="font-semibold text-md">Paiements</h3>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <Input
                                type="number"
                                placeholder="Nb de paiements"
                                className="w-full sm:w-32"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleSplitPayments(Number((e.target as HTMLInputElement).value));
                                    }
                                }}
                            />
                            <Button variant="outline" className="w-full sm:w-auto" onClick={handleAddPayment}>
                                + Ajouter un paiement
                            </Button>
                        </div>
                    </div>

                    {data.payments.length === 0 && (
                        <p className="text-sm italic text-muted-foreground">
                            Aucun paiement ajouté.
                        </p>
                    )}

                    {data.payments.map((p, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 border sm:border-0 p-3 sm:p-0 rounded-md">
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                className="w-full sm:w-32"
                                value={p.amount}
                                onChange={(e) => {
                                    const updated = [...data.payments];
                                    updated[idx].amount = parseFloat(e.target.value) || 0;
                                    setData("payments", updated);
                                }}
                            />
                            <Input
                                type="date"
                                className="w-full sm:w-40"
                                value={p.payment_date || ""}
                                onChange={(e) => {
                                    const updated = [...data.payments];
                                    updated[idx].payment_date = e.target.value;
                                    setData("payments", updated);
                                }}
                            />
                            <Select
                                value={p.status}
                                onValueChange={(v) => {
                                    const updated = [...data.payments];
                                    updated[idx].status = v;
                                    setData("payments", updated);
                                }}
                            >
                                <SelectTrigger className="w-full sm:w-32">
                                    <SelectValue placeholder="Statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">En attente</SelectItem>
                                    <SelectItem value="paid">Payé</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="destructive"
                                size="icon"
                                className="w-full sm:w-10 sm:flex-none"
                                onClick={() => handleRemovePayment(idx)}
                            >
                                <span className="sm:hidden mr-2">Supprimer</span> ✕
                            </Button>
                        </div>
                    ))}

                    {data.payments.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                            Total paiements programmés :{" "}
                            {currencyFormatter(
                                data.payments.reduce((s, p) => s + (p.amount || 0), 0)
                            )}
                        </p>
                    )}
                </div>
            </div>

            {/* --- FOOTER --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 gap-4">
                <p className="text-md font-semibold">
                    Total : {currencyFormatter(total)} — Payé : {currencyFormatter(totalPaid)}
                </p>
                <Button className="w-full sm:w-auto" onClick={handleSubmit} disabled={processing}>
                    {processing && <Loader2Icon className="animate-spin mr-2" />}
                    {processing ? "En cours de vente..." : "Lancer la vente"}
                </Button>
            </div>
        </>
    );
}

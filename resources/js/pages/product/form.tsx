import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PlusCircle, Edit } from "lucide-react";
import { useForm } from "@inertiajs/react";
import type { Category, Product, Unity } from "@/types";
import { toast } from "sonner";
import { cn, inputClassNames } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = {
    open: boolean;
    onClose: () => void;
    product: Product | null;
    categories: Category[];
    unities: Unity[];
    submitUrl: string;
    method: "POST" | "PUT";
};

type FormData = {
    name: string;
    description: string;
    selling_price: string;
    purchasing_price: string;
    threshold_alert: string;
    category_id: string;
    unity_id: string;
    _method?: string;
};

export default function ProductForm({ open, onClose, product, categories, unities, submitUrl, method }: Props) {
    const form = useForm<FormData>({
        name: '',
        description: '',
        selling_price: '',
        purchasing_price: '',
        threshold_alert: '',
        category_id: '',
        unity_id: ''
    });

    useEffect(() => {
        if (product) {
            form.setData({
                name: product.name,
                description: product.description ?? '',
                selling_price: String(product.selling_price),
                purchasing_price: product.purchasing_price ? String(product.purchasing_price) : '',
                threshold_alert: String(product.threshold_alert),
                category_id: String(product.category_id),
                unity_id: String(product.unity_id)
            });
        } else {
            form.reset();
        }

        form.clearErrors();
    }, [product]);

    useEffect(() => {
        if (!open) {
            form.clearErrors();
        }
    }, [open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (method === "PUT") {
            form.transform((data) => ({ ...data, _method: "PUT" }));
        } else {
            form.transform((data) => {
                const { _method, ...rest } = data as FormData & { _method?: string };
                return rest;
            });
        }

        form.post(submitUrl, {
            forceFormData: true,
            preserveState: true,
            preserveScroll: 'errors',
            onSuccess: () => {
                toast.success(
                    <div className="flex flex-col">
                        <span className="font-semibold">Succès</span>
                        <span className="text-sm">{method === "PUT" ? "Produit mis à jour !" : "Produit créé !"}</span>
                    </div>
                );

                onClose();
                form.reset();
            },
            onError: (errors) => {
                if (errors.error) {
                    toast.error(
                        <div className="flex flex-col">
                            <span className="font-semibold">Erreur</span>
                            <span className="text-sm">{errors.error}</span>
                        </div>
                    );
                }
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                        {product ? <Edit className="h-5 w-5 text-primary" /> : <PlusCircle className="h-5 w-5 text-primary" />}
                        <DialogTitle className="text-lg font-semibold">
                            {product ? "Modifier le produit" : "Ajouter un produit"}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-sm text-muted-foreground">
                        {product ? "Modifiez les informations du produit existant." : "Remplissez le formulaire pour créer un nouveau produit."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <Label htmlFor="name" className="font-medium text-sm">Nom</Label>
                        <Input
                            id="name"
                            value={form.data.name}
                            onChange={(e) => form.setData("name", e.target.value)}
                            onFocus={() => form.clearErrors("name")}
                            placeholder="Entrez le nom"
                            className={cn("mt-1", inputClassNames())}
                        />
                        {form.errors.name && <p className="mt-1 text-xs text-destructive">{form.errors.name}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <Label htmlFor="description" className="font-medium text-sm">Description</Label>
                        <Textarea
                            id="description"
                            value={form.data.description}
                            onChange={(e) => form.setData("description", e.target.value)}
                            onFocus={() => form.clearErrors("description")}
                            placeholder="Brève description..."
                            rows={3}
                            className={cn("mt-1 resize-none", inputClassNames())}
                        />
                        {form.errors.description && <p className="mt-1 text-xs text-destructive">{form.errors.description}</p>}
                    </div>

                    {/* Prices & Alert - CHANGED to flex-col sm:flex-row */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 space-y-1">
                            <Label htmlFor="selling_price" className="font-medium text-sm">Prix de vente <span className="text-red-500">*</span></Label>
                            <Input
                                id="selling_price"
                                type="number"
                                value={form.data.selling_price}
                                onChange={(e) => form.setData("selling_price", e.target.value)}
                                onFocus={() => form.clearErrors("selling_price")}
                                className={cn("mt-1", inputClassNames())}
                            />
                            {form.errors.selling_price && <p className="mt-1 text-xs text-destructive">{form.errors.selling_price}</p>}
                        </div>

                        <div className="flex-1 space-y-1">
                            <Label htmlFor="purchasing_price" className="font-medium text-sm">Prix d'achat</Label>
                            <Input
                                id="purchasing_price"
                                type="number"
                                value={form.data.purchasing_price}
                                onChange={(e) => form.setData("purchasing_price", e.target.value)}
                                onFocus={() => form.clearErrors("purchasing_price")}
                                className={cn("mt-1", inputClassNames())}
                            />
                            {form.errors.purchasing_price && (
                                <p className="mt-1 text-xs text-destructive">{form.errors.purchasing_price}</p>
                            )}
                        </div>

                        <div className="flex-1 space-y-1">
                            <Label htmlFor="threshold_alert" className="font-medium text-sm">Stock d'alerte <span className="text-red-500">*</span></Label>
                            <Input
                                id="threshold_alert"
                                type="number"
                                value={form.data.threshold_alert}
                                onChange={(e) => form.setData("threshold_alert", e.target.value)}
                                onFocus={() => form.clearErrors("threshold_alert")}
                                className={cn("mt-1", inputClassNames())}
                            />
                            {form.errors.threshold_alert && (
                                <p className="mt-1 text-xs text-destructive">{form.errors.threshold_alert}</p>
                            )}
                        </div>
                    </div>

                    {/* Category & Unity - CHANGED to flex-col sm:flex-row */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 space-y-1">
                            <Label htmlFor="category_id" className="font-medium text-sm">Catégorie <span className="text-red-500">*</span></Label>
                            <Select
                                value={form.data.category_id}
                                onValueChange={(val) => form.setData("category_id", val)}
                            >
                                <SelectTrigger className={cn("mt-1", inputClassNames())}>
                                    <SelectValue placeholder="Choisissez une catégorie" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={String(cat.id)}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.errors.category_id && (
                                <p className="mt-1 text-xs text-destructive">{form.errors.category_id}</p>
                            )}
                        </div>

                        <div className="flex-1 space-y-1">
                            <Label htmlFor="unity_id" className="font-medium text-sm">Unité <span className="text-red-500">*</span></Label>
                            <Select
                                value={form.data.unity_id}
                                onValueChange={(val) => form.setData("unity_id", val)}
                            >
                                <SelectTrigger className={cn("mt-1", inputClassNames())}>
                                    <SelectValue placeholder="Choisissez une unité" />
                                </SelectTrigger>
                                <SelectContent>
                                    {unities.map((u) => (
                                        <SelectItem key={u.id} value={String(u.id)}>
                                            {u.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.errors.unity_id && (
                                <p className="mt-1 text-xs text-destructive">{form.errors.unity_id}</p>
                            )}
                        </div>
                    </div>

                    {/* Dialog Footer - Updated for better mobile stacking */}
                    <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            className="px-6 py-2 w-full sm:w-auto"
                            onClick={() => {
                                onClose();
                                form.reset();
                                form.clearErrors();
                            }}
                        >
                            Annuler
                        </Button>
                        <Button type="submit" className="px-6 py-2 w-full sm:w-auto" disabled={form.processing}>
                            {product ? "Mettre à jour" : "Créer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PlusCircle, Edit, ChevronsUpDown, Check } from "lucide-react";
import { useForm } from "@inertiajs/react";
import type { Product, Stock, Supplier } from "@/types";
import { toast } from "sonner";
import { cn, inputClassNames, plural } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = {
    open: boolean;
    onClose: () => void;
    stock: Stock | null;
    suppliers: Supplier[];
    products: Product[];
    submitUrl: string;
    method: "POST" | "PUT";
};

type FormData = {
    quantity_in_stock: string;
    product_id: string;
    supplier_id: string;
    _method?: string;
};

export default function StockForm({ open, onClose, stock, suppliers, products, submitUrl, method }: Props) {
    const form = useForm<FormData>({
        quantity_in_stock: '',
        product_id: '',
        supplier_id: ''
    });

    useEffect(() => {
        if (stock) {
            form.setData({
                quantity_in_stock: String(stock.quantity_in_stock),
                product_id: String(stock.product_id),
                supplier_id: String(stock.supplier_id),
            });
        } else {
            form.reset();
        }

        form.clearErrors();
    }, [stock]);

    // When dialog closes, clear processing/errors and reset form if desired
    useEffect(() => {
        if (!open) {
            // keep server validation errors cleared
            form.clearErrors();
        }
    }, [open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // For PUT, instruct Laravel to treat as PUT through _method field
        if (method === "PUT") {
            form.transform((data) => ({ ...data, _method: "PUT" }));
        } else {
            // ensure we don't send a lingering _method for POST
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
                        <span className="text-sm">{method === "PUT" ? "Catégorie mise à jour !" : "Catégorie créée !"}</span>
                    </div>
                );
                // reset/close
                onClose();
                // Reset form to defaults so next "create" is clean
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
                        {stock ? <Edit className="h-5 w-5 text-primary" /> : <PlusCircle className="h-5 w-5 text-primary" />}
                        <DialogTitle className="text-lg font-semibold">
                            {stock ? "Modifier le stock" : "Ajouter un stock"}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-sm text-muted-foreground">
                        {stock ? "Modifiez les informations du stock existant." : "Remplissez le formulaire pour créer un nouveau stock."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="quantity_in_stock" className="font-medium text-sm">Quantité en stock <span className="text-red-500">*</span></Label>
                        <Input
                            id="quantity_in_stock"
                            type="number"
                            value={form.data.quantity_in_stock}
                            onChange={(e) => form.setData("quantity_in_stock", e.target.value)}
                            onFocus={() => form.clearErrors("quantity_in_stock")}
                            className={cn("mt-1", inputClassNames())}
                        />
                        {form.errors.quantity_in_stock && (
                            <p className="mt-1 text-xs text-destructive">{form.errors.quantity_in_stock}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="product_id" className="font-medium text-sm">Produit <span className="text-red-500">*</span></Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className="mt-1 w-full justify-between"
                                >
                                    {form.data.product_id
                                        ? products.find(p => String(p.id) === form.data.product_id)?.name
                                        : "Choisissez un produit"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput
                                        placeholder="Rechercher un produit..."
                                    />
                                    <CommandEmpty>Aucun produit trouvé.</CommandEmpty>
                                    <CommandGroup className='max-h-60 overflow-y-auto'>
                                        {products.map(product => (
                                            <CommandItem
                                                key={product.id}
                                                onSelect={() => form.setData("product_id", String(product.id))}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        form.data.product_id === String(product.id) ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {product.name} - <span className='italic text-gray'>{plural(product.quantity_in_stock, product.unity.name)}</span>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {form.errors.product_id && (
                            <p className="mt-1 text-xs text-destructive">{form.errors.product_id}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="supplier_id" className="font-medium text-sm">Fournisseur</Label>
                        <Select
                            value={form.data.supplier_id}
                            onValueChange={(value) => form.setData('supplier_id', value)}
                        >
                            <SelectTrigger className={cn("mt-1", inputClassNames())}>
                                <SelectValue placeholder="Choisissez un fournisseur" />
                            </SelectTrigger>
                            <SelectContent>
                                {suppliers.map(supplier => (
                                    <SelectItem key={supplier.id} value={String(supplier.id)}>
                                        {supplier.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {form.errors.supplier_id && (
                            <p className="mt-1 text-xs text-destructive">{form.errors.supplier_id}</p>
                        )}
                    </div>

                    <DialogFooter className="flex justify-end gap-3 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            className="px-6 py-2"
                            onClick={() => {
                                onClose();
                                form.reset();
                                form.clearErrors();
                            }}
                        >
                            Annuler
                        </Button>
                        <Button type="submit" className="px-6 py-2" disabled={form.processing}>
                            {stock ? "Mettre à jour" : "Créer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

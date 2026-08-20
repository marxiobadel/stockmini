import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowRightLeft, ChevronsUpDown, Check } from "lucide-react";
import { useForm } from "@inertiajs/react";
import type { Product, Stock } from "@/types";
import { toast } from "sonner";
import { cn, inputClassNames } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

type Props = {
    open: boolean;
    onClose: () => void;
    stock: Stock | null;
    stocks: Stock[];
    products: Product[];
};

type ConversionFormData = {
    source_stock_id: string;
    source_quantity: string;
    destination_product_id: string;
    destination_quantity: string;
};

export default function ConversionForm({ open, onClose, stock, stocks, products }: Props) {
    const form = useForm<ConversionFormData>({
        source_stock_id: '',
        source_quantity: '',
        destination_product_id: '',
        destination_quantity: ''
    });

    useEffect(() => {
        if (stock) {
            form.setData('source_stock_id', stock ? String(stock.id) : '');
        }

        if (!open) {
            form.reset();
            form.clearErrors();
        }
    }, [open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        form.post(route('stocks.convert'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(
                    <div className="flex flex-col">
                        <span className="font-semibold">Succès</span>
                        <span className="text-sm">Stock converti avec succès !</span>
                    </div>
                );
                onClose();
            },
            onError: (errors) => {
                if (errors.error) {
                    toast.error(errors.error);
                }
            },
        });
    };

    // Helper pour trouver le nom du produit depuis le stock
    const getSourceStockLabel = (stockId: string) => {
        const stock = stocks.find(s => String(s.id) === stockId);
        if (!stock) return "Sélectionnez un stock source";
        return `${stock.product?.name} (Dispo: ${stock.quantity_in_stock})`;
    };

    return (
        <Dialog open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                        <ArrowRightLeft className="h-5 w-5 text-primary" />
                        <DialogTitle className="text-lg font-semibold">
                            Convertir un stock
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Déballez ou transformez un produit en un autre (ex: 1 Carton -{'>'} 8 Bouteilles). Le fournisseur sera conservé.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-start">

                        {/* --- COLONNE SOURCE --- */}
                        <div className="space-y-4 bg-muted/30 p-4 rounded-lg border">
                            <h3 className="font-medium flex items-center text-sm text-muted-foreground mb-4 uppercase tracking-wider">
                                À partir de
                            </h3>
                            <div>
                                <Label className="font-medium text-sm">Stock d'origine <span className="text-red-500">*</span></Label>
                                <Popover modal={true}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className="mt-1 w-full justify-between"
                                        >
                                            <span className="truncate">
                                                {form.data.source_stock_id
                                                    ? getSourceStockLabel(form.data.source_stock_id)
                                                    : "Sélectionner..."}
                                            </span>
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>

                                    <PopoverContent className="w-full p-0">
                                        <Command>
                                            <CommandInput placeholder="Rechercher un stock..." />
                                            <CommandList>
                                                <CommandEmpty>Aucun stock trouvé.</CommandEmpty>
                                                <CommandGroup className="max-h-60 overflow-y-auto">
                                                    {stocks
                                                        .filter((s) => s.quantity_in_stock > 0)
                                                        .map((stock) => (
                                                            <CommandItem
                                                                key={stock.id}
                                                                onSelect={() => form.setData("source_stock_id", String(stock.id))}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        form.data.source_stock_id === String(stock.id)
                                                                            ? "opacity-100"
                                                                            : "opacity-0"
                                                                    )}
                                                                />
                                                                {stock.product?.name} - Dispo: {stock.quantity_in_stock}
                                                            </CommandItem>
                                                        ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {form.errors.source_stock_id && <p className="mt-1 text-xs text-destructive">{form.errors.source_stock_id}</p>}
                            </div>

                            <div>
                                <Label className="font-medium text-sm">Quantité à déduire <span className="text-red-500">*</span></Label>
                                <Input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    placeholder="Ex: 1"
                                    value={form.data.source_quantity}
                                    onChange={(e) => form.setData("source_quantity", e.target.value)}
                                    className={cn("mt-1", inputClassNames())}
                                />
                                {form.errors.source_quantity && <p className="mt-1 text-xs text-destructive">{form.errors.source_quantity}</p>}
                            </div>
                        </div>

                        {/* --- ICONE CENTRALE --- */}
                        <div className="hidden md:flex flex-col justify-center h-full pt-8">
                            <div className="bg-primary/10 p-3 rounded-full">
                                <ArrowRightLeft className="h-6 w-6 text-primary" />
                            </div>
                        </div>

                        {/* --- COLONNE DESTINATION --- */}
                        <div className="space-y-4 bg-muted/30 p-4 rounded-lg border">
                            <h3 className="font-medium flex items-center text-sm text-muted-foreground mb-4 uppercase tracking-wider">
                                Convertir en
                            </h3>
                            <div>
                                <Label className="font-medium text-sm">Produit cible <span className="text-red-500">*</span></Label>
                                <Popover modal={true}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" role="combobox" className="mt-1 w-full justify-between">
                                            <span className="truncate">{form.data.destination_product_id ? products.find(p => String(p.id) === form.data.destination_product_id)?.name : "Sélectionner..."}</span>
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                        <Command>
                                            <CommandInput placeholder="Rechercher un produit..." />
                                            <CommandList>
                                                <CommandEmpty>Aucun produit trouvé.</CommandEmpty>
                                                <CommandGroup className='max-h-60 overflow-y-auto'>
                                                    {products.map(product => (
                                                        <CommandItem
                                                            key={product.id}
                                                            onSelect={() => form.setData("destination_product_id", String(product.id))}
                                                        >
                                                            <Check className={cn("mr-2 h-4 w-4", form.data.destination_product_id === String(product.id) ? "opacity-100" : "opacity-0")} />
                                                            {product.name} - {product.unity.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {form.errors.destination_product_id && <p className="mt-1 text-xs text-destructive">{form.errors.destination_product_id}</p>}
                            </div>

                            <div>
                                <Label className="font-medium text-sm">Quantité à ajouter <span className="text-red-500">*</span></Label>
                                <Input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    placeholder="Ex: 8"
                                    value={form.data.destination_quantity}
                                    onChange={(e) => form.setData("destination_quantity", e.target.value)}
                                    className={cn("mt-1", inputClassNames())}
                                />
                                {form.errors.destination_quantity && <p className="mt-1 text-xs text-destructive">{form.errors.destination_quantity}</p>}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="outline" className="px-6 py-2" onClick={onClose}>
                            Annuler
                        </Button>
                        <Button type="submit" className="px-6 py-2" disabled={form.processing}>
                            {form.processing ? "Conversion..." : "Convertir le stock"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
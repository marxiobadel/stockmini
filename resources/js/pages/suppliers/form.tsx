import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PlusCircle, Edit } from "lucide-react";
import { useForm } from "@inertiajs/react";
import type { Supplier } from "@/types";
import { toast } from "sonner";
import { cn, inputClassNames } from "@/lib/utils";

type Props = {
    open: boolean;
    onClose: () => void;
    supplier: Supplier | null;
    submitUrl: string;
    method: "POST" | "PUT";
};

type FormData = {
    name: string;
    phone: string;
    address: string;
    _method?: string;
};

export default function SupplierForm({ open, onClose, supplier, submitUrl, method }: Props) {
    const form = useForm<FormData>({
        name: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        if (supplier) {
            form.setData({
                name: supplier.name ?? "",
                phone: supplier.phone ?? "",
                address: supplier.address ?? "",
            });
        } else {
            form.reset("name", "phone", "address");
        }

        form.clearErrors();
    }, [supplier]);

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
                        <span className="text-sm">{method === "PUT" ? "Fournisseur mis à jour !" : "Fournisseur créé !"}</span>
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
                        {supplier ? <Edit className="h-5 w-5 text-primary" /> : <PlusCircle className="h-5 w-5 text-primary" />}
                        <DialogTitle className="text-lg font-semibold">
                            {supplier ? "Modifier le fournisseur" : "Ajouter un fournisseur"}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-sm text-muted-foreground">
                        {supplier ? "Modifiez les informations du fournisseur existant." : "Remplissez le formulaire pour créer un nouveau fournisseur."}
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
                        {form.errors.name && <p className="mt-1 text-xs text-red-600">{form.errors.name}</p>}
                    </div>

                    <div>
                        <Label htmlFor="phone" className="font-medium text-sm">Téléphone</Label>
                        <Input
                            id="phone"
                            value={form.data.phone}
                            onChange={(e) => form.setData("phone", e.target.value)}
                            onFocus={() => form.clearErrors("phone")}
                            placeholder="Entrez le téléphone"
                            className={cn("mt-1", inputClassNames())}
                        />
                        {form.errors.phone && <p className="mt-1 text-xs text-red-600">{form.errors.phone}</p>}
                    </div>

                    <div>
                        <Label htmlFor="address" className="font-medium text-sm">Adresse</Label>
                        <Input
                            id="address"
                            value={form.data.address}
                            onChange={(e) => form.setData("address", e.target.value)}
                            onFocus={() => form.clearErrors("address")}
                            placeholder="Entrez l'adresse"
                            className={cn("mt-1", inputClassNames())}
                        />
                        {form.errors.address && <p className="mt-1 text-xs text-red-600">{form.errors.address}</p>}
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
                            {supplier ? "Mettre à jour" : "Créer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

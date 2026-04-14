import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PlusCircle, Edit } from "lucide-react";
import { useForm } from "@inertiajs/react";
import type { User } from "@/types";
import { toast } from "sonner";
import { cn, inputClassNames } from "@/lib/utils";

type Props = {
    open: boolean;
    onClose: () => void;
    customer: User | null;
    submitUrl: string;
    method: "POST" | "PUT";
};

type FormData = {
    name: string;
    email: string;
    phone: string;
    address: string;
    _method?: string;
};

export default function CustomerForm({ open, onClose, customer, submitUrl, method }: Props) {
    const form = useForm<FormData>({
        name: '',
        phone: '',
        email: '',
        address: '',
    });

    useEffect(() => {
        if (customer) {
            form.setData({
                name: customer.name ?? "",
                phone: customer.phone ?? "",
                email: customer.email ?? "",
                address: customer.address ?? "",
            });
        } else {
            form.reset('name', 'phone', 'email', 'address');
        }

        form.clearErrors();
    }, [customer]);

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
                        <span className="text-sm">{method === "PUT" ? "Client mis à jour !" : "Client créé !"}</span>
                    </div>
                );
                // reset/close
                onClose();
                // Reset form to defaults so next "create" is clean
                form.reset('name', 'phone', 'email', 'address');
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
                        {customer ? <Edit className="h-5 w-5 text-primary" /> : <PlusCircle className="h-5 w-5 text-primary" />}
                        <DialogTitle className="text-lg font-semibold">
                            {customer ? "Modifier le client" : "Ajouter un client"}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-sm text-muted-foreground">
                        {customer ? "Modifiez les informations du client existant." : "Remplissez le formulaire pour créer un nouveau client."}
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
                        <Label htmlFor="email" className="font-medium text-sm">E-mail</Label>
                        <Input
                            id="email"
                            value={form.data.email}
                            onChange={(e) => form.setData("email", e.target.value)}
                            onFocus={() => form.clearErrors("email")}
                            placeholder="Entrez l'e-mail"
                            className={cn("mt-1", inputClassNames())}
                        />
                        {form.errors.email && <p className="mt-1 text-xs text-red-600">{form.errors.email}</p>}
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
                                form.reset('name', 'phone', 'email', 'address');
                                form.clearErrors();
                            }}
                        >
                            Annuler
                        </Button>
                        <Button type="submit" className="px-6 py-2" disabled={form.processing}>
                            {customer ? "Mettre à jour" : "Créer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

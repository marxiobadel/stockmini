import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PlusCircle, Edit } from "lucide-react";
import { useForm } from "@inertiajs/react";
import type { Category } from "@/types";
import { toast } from "sonner";
import { cn, inputClassNames } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

type Props = {
    open: boolean;
    onClose: () => void;
    category: Category | null;
    submitUrl: string;
    method: "POST" | "PUT";
};

type FormData = {
    name: string;
    description: string;
    _method?: string;
};

export default function CategoryForm({ open, onClose, category, submitUrl, method }: Props) {
    const form = useForm<FormData>({
        name: "",
        description: "",
    });

    // Important: whenever `category` changes (open for edit), populate the form
    useEffect(() => {
        if (category) {
            form.setData({
                name: category.name ?? "",
                description: category.description ?? "",
            });
        } else {
            form.reset("name", "description");
        }

        form.clearErrors();
    }, [category]);

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
                form.reset("name", "description");
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
                        {category ? <Edit className="h-5 w-5 text-primary" /> : <PlusCircle className="h-5 w-5 text-primary" />}
                        <DialogTitle className="text-lg font-semibold">
                            {category ? "Modifier la catégorie" : "Ajouter une catégorie"}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-sm text-muted-foreground">
                        {category ? "Modifiez les informations de la catégorie existante." : "Remplissez le formulaire pour créer une nouvelle catégorie."}
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

                    <div className="grid gap-2">
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
                        {form.errors.description && <p className="text-sm text-destructive">{form.errors.description}</p>}
                    </div>

                    <DialogFooter className="flex justify-end gap-3 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            className="px-6 py-2"
                            onClick={() => {
                                onClose();
                                form.reset("name", "description");
                                form.clearErrors();
                            }}
                        >
                            Annuler
                        </Button>
                        <Button type="submit" className="px-6 py-2" disabled={form.processing}>
                            {category ? "Mettre à jour" : "Créer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

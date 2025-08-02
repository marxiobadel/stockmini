import { SharedData, Unity, type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import HeadingSmall from '@/components/heading-small';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Plus, Trash } from "lucide-react"
import { Fragment, useEffect, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Unités de produit',
        href: route('unities.index'),
    },
];

type ProductProps = {
    unities: Unity[];
};

export default function Product({ unities }: ProductProps) {
    const { flash } = usePage<SharedData>().props;

    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [confirmDeleteUnity, setConfirmDeleteUnity] = useState<Unity | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('unities.store'), {
            onSuccess: () => {
                reset();
                setAddDialogOpen(false);
                toast('Unité ajoutée', {
                    description: "L'unité a été enregistrée avec succès.",
                    duration: 4000,
                });
            },
        });
    };

    const confirmDelete = (unity: Unity) => {
        setConfirmDeleteUnity(unity);
    };

    const handleDelete = () => {
        if (!confirmDeleteUnity) return;

        setDeletingId(confirmDeleteUnity.id);
        router.delete(route('unities.destroy', confirmDeleteUnity.id), {
            onError: () => {
                toast.error('Impossible de supprimer cette unité.');
            },
            onFinish: () => {
                setDeletingId(null);
                setConfirmDeleteUnity(null);
            },
        });
    };

    useEffect(() => {
        if (flash?.message) {
            if (flash.status === 'error') {
                toast.error(flash.message);
            } else {
                toast.success(flash.message);
            }
        }
    }, [flash]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Unités de produit" />

            <SettingsLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <HeadingSmall title="Unités de produit" description="Ajouter des unités pour vos divers produits" />
                        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                            <Button variant="default" size="sm" onClick={() => setAddDialogOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" /> Ajouter
                            </Button>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Nouvelle unité</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <Input
                                        type="text"
                                        placeholder="Nom de l'unité"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500">{errors.name}</p>
                                    )}
                                    <DialogFooter>
                                        <Button type="submit" disabled={processing}>
                                            Ajouter
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <ScrollArea className="h-72 w-64 rounded-md border">
                        <div className="p-4">
                            <h4 className="mb-4 text-sm leading-none font-medium">Unités</h4>
                            {unities.map((unity) => (
                                <Fragment key={unity.id}>
                                    <div className="flex items-center justify-between text-sm">
                                        <span>{unity.name}</span>
                                        <Button
                                            onClick={() => confirmDelete(unity)}
                                            size="icon"
                                            variant="ghost"
                                        >
                                            <Trash className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                    <Separator className="my-2" />
                                </Fragment>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Dialog de confirmation de suppression */}
                <Dialog open={!!confirmDeleteUnity} onOpenChange={(open) => !open && setConfirmDeleteUnity(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Supprimer cette unité ?</DialogTitle>
                            <DialogDescription>
                                Êtes-vous sûr de vouloir supprimer l'unité « {confirmDeleteUnity?.name} » ? Cette action est irréversible.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="secondary" onClick={() => setConfirmDeleteUnity(null)}>
                                Annuler
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={deletingId === confirmDeleteUnity?.id}
                            >
                                Supprimer
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </SettingsLayout>
        </AppLayout>
    );
}

"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2Icon, FileWarning, Plus } from "lucide-react"
import { Category, Unity } from "@/types"

interface ProductDialogProps {
    open: boolean
    setOpen: (open: boolean) => void
    isEditMode: boolean
    data: any
    setData: (field: string, value: any) => void
    errors: Record<string, string>
    categories: Category[]
    unities: Unity[]
    processing: boolean
    handleSubmit: () => void
    reset: () => void
}

export default function ProductDialog({
    open,
    setOpen,
    isEditMode,
    data,
    setData,
    errors,
    categories,
    unities,
    processing,
    handleSubmit,
    reset,
}: ProductDialogProps) {
    return (
        <Dialog
            open={open}
            onOpenChange={(val) => {
                setOpen(val)
                if (!val) reset()
            }}
        >
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un produit
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? "Modifier le produit" : "Ajouter un produit"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Nom */}
                    <div className="space-y-1">
                        <Label htmlFor="name">Nom <span className="text-red-500">*</span></Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            placeholder="Ex: Riz bijou 50 kg ..."
                        />
                        {errors.name && (
                            <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                                <FileWarning className="w-4 h-4" />
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData("description", e.target.value)}
                            placeholder="Brève description du produit"
                            rows={4}
                        />
                        {errors.description && (
                            <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                                <FileWarning className="w-4 h-4" />
                                {errors.description}
                            </p>
                        )}
                    </div>

                    {/* Prices + Stock Alert */}
                    <div className="flex gap-4">
                        <div className="flex-1 space-y-1">
                            <Label htmlFor="selling_price">Prix de vente <span className="text-red-500">*</span></Label>
                            <Input
                                id="selling_price"
                                type="number"
                                value={data.selling_price}
                                onChange={(e) => setData("selling_price", e.target.value)}
                            />
                            {errors.selling_price && (
                                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                                    <FileWarning className="w-4 h-4" />
                                    {errors.selling_price}
                                </p>
                            )}
                        </div>

                        <div className="flex-1 space-y-1">
                            <Label htmlFor="purchasing_price">Prix d'achat</Label>
                            <Input
                                id="purchasing_price"
                                type="number"
                                value={data.purchasing_price}
                                onChange={(e) => setData("purchasing_price", e.target.value)}
                            />
                            {errors.purchasing_price && (
                                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                                    <FileWarning className="w-4 h-4" />
                                    {errors.purchasing_price}
                                </p>
                            )}
                        </div>

                        <div className="flex-1 space-y-1">
                            <Label htmlFor="threshold_alert">Stock d'alerte <span className="text-red-500">*</span></Label>
                            <Input
                                id="threshold_alert"
                                type="number"
                                value={data.threshold_alert}
                                onChange={(e) => setData("threshold_alert", e.target.value)}
                            />
                            {errors.threshold_alert && (
                                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                                    <FileWarning className="w-4 h-4" />
                                    {errors.threshold_alert}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Category + Unity */}
                    <div className="flex gap-4">
                        <div className="flex-1 space-y-1">
                            <Label htmlFor="category_id">Catégorie <span className="text-red-500">*</span></Label>
                            <Select
                                value={data.category_id}
                                onValueChange={(val) => setData("category_id", val)}
                            >
                                <SelectTrigger>
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
                            {errors.category_id && (
                                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                                    <FileWarning className="w-4 h-4" />
                                    {errors.category_id}
                                </p>
                            )}
                        </div>

                        <div className="flex-1 space-y-1">
                            <Label htmlFor="unity_id">Unité <span className="text-red-500">*</span></Label>
                            <Select
                                value={data.unity_id}
                                onValueChange={(val) => setData("unity_id", val)}
                            >
                                <SelectTrigger>
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
                            {errors.unity_id && (
                                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                                    <FileWarning className="w-4 h-4" />
                                    {errors.unity_id}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end">
                        <Button onClick={handleSubmit} disabled={processing}>
                            {processing && <Loader2Icon className="animate-spin" />}
                            {processing ? "Enregistrement..." : "Enregistrer"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Eye, ArrowRightLeft } from "lucide-react";
import { router, usePage } from "@inertiajs/react";
import type { SharedData, User } from "@/types";

interface RowActionsProps<T> {
    row: T;
    onShow?: (item: T) => void;
    onConvert?: (item: T) => void;
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    /** Optional route name for Inertia navigation */
    editRoute?: string;
    showRoute?: string;
    user?: User
}

export function RowActions<T extends Record<string, any>>({
    row,
    onShow,
    onConvert,
    onEdit,
    onDelete,
    editRoute,
    showRoute,
    user
}: RowActionsProps<T>) {
    const handleShow = () => {
        if (showRoute) {
            router.visit(showRoute);
        }
    };

    const handleEdit = () => {
        // Use local callback if provided
        if (onEdit) return setTimeout(() => onEdit(row), 100);

        // Otherwise, if editRoute is provided, navigate via Inertia
        if (editRoute) {
            router.visit(editRoute);
        }
    };

    const handleConvert = () => {
        if (onConvert) setTimeout(() => onConvert(row), 100);
    };
  
    const handleDelete = () => {
        if (onDelete) setTimeout(() => onDelete(row), 100);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
                {(onShow && showRoute) && (
                    <DropdownMenuItem onClick={handleShow}>
                        <Eye className="mr-1 h-4 w-4" /> Voir
                    </DropdownMenuItem>
                )}

                {onConvert && (
                    <DropdownMenuItem onClick={handleConvert}>
                        <ArrowRightLeft className="mr-1 h-4 w-4" /> Convertir
                    </DropdownMenuItem>
                )}

                {(onEdit || editRoute) && (
                    <DropdownMenuItem onClick={handleEdit}>
                        <Edit className="mr-1 h-4 w-4" /> Éditer
                    </DropdownMenuItem>
                )}

                {onDelete && user?.id !== row.id && (
                    <DropdownMenuItem
                        onClick={handleDelete}
                        className="text-destructive cursor-pointer"
                    >
                        <Trash2 className="mr-1 h-4 w-4" /> Supprimer
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

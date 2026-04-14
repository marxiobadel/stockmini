import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { router } from "@inertiajs/react";

interface RowActionsProps<T> {
    row: T;
    onShow?: (item: T) => void;
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    /** Optional route name for Inertia navigation */
    editRoute?: string;
    showRoute?: string;
}

export function RowActions<T extends Record<string, any>>({
    row,
    onShow,
    onEdit,
    onDelete,
    editRoute,
    showRoute
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

                {(onEdit || editRoute) && (
                    <DropdownMenuItem onClick={handleEdit}>
                        <Edit className="mr-1 h-4 w-4" /> Éditer
                    </DropdownMenuItem>
                )}

                {onDelete && (
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

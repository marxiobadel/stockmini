import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle } from "lucide-react";
import { ReactNode } from "react";

interface ConfirmDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    message: string | ReactNode;
    onConfirm: () => void;
}

export default function ConfirmDeleteDialog({
    open,
    onOpenChange,
    title = "Confirmer la suppression",
    message,
    onConfirm,
}: ConfirmDeleteDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-md">
                <AlertDialogHeader className="flex flex-col items-center text-center space-y-2">
                    <AlertCircle aria-hidden="true" className="h-10 w-10 text-destructive" />
                    <AlertDialogTitle className="text-lg font-semibold">{title}</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm text-muted-foreground">
                        {message}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex justify-center gap-2">
                    <AlertDialogCancel className="px-4 py-2 border rounded-lg focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-transparent">
                        Annuler
                    </AlertDialogCancel>
                    <AlertDialogAction
                        className="px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive/90 flex items-center gap-1"
                        onClick={onConfirm}
                    >
                        Supprimer
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

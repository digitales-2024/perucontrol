import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { RemoveQuotation } from "../actions";
import { components } from "@/types/api";
import { toastWrapper } from "@/types/toasts";

interface DeleteClientProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    quotation: components["schemas"]["Quotation2"],
    showTrigger?: boolean;
}

export function DeleteQuotation({ open, onOpenChange, quotation, showTrigger = true }: DeleteClientProps)
{
    const onDeleteQuotationHandler = async() =>
    {
        const [, err] = await toastWrapper(RemoveQuotation(quotation.id!), {
            loading: "Eliminando cotización...",
            success: "Cotización eliminada exitosamente!",
        });
        if (err !== null)
        {
            return;
        }
        onOpenChange(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            {showTrigger ? (
                <AlertDialogTrigger asChild>
                    <Button variant="outline">
                        Eliminar
                    </Button>
                </AlertDialogTrigger>
            ) : null}
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        ¿Esta absolutamente seguro?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente los datos de la cotización.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>
                        Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                        aria-label="Delete selected rows"
                        onClick={onDeleteQuotationHandler}
                    >
                        Continuar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

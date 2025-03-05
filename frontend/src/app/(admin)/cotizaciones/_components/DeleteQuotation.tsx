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

interface DeleteClientProps {
open: boolean;
onOpenChange: (open: boolean) => void;
quotation: components["schemas"]["QuotationGetDTO"],
showTrigger?: boolean;
}

export function DeleteQuotation({open, onOpenChange, quotation, showTrigger = true}: DeleteClientProps)
{

    const onDeleteQuotationHandler = () =>
    {
        RemoveQuotation(quotation.id!);
        onOpenChange(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            { showTrigger ? (
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

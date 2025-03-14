"use client";

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
import { UpdateStatus } from "../actions";
import { components } from "@/types/api";

interface RejectQuotationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotation: components["schemas"]["Quotation2"],
  showTrigger?: boolean;
}

export function AlertDialogRejectQuotation({
    open,
    onOpenChange,
    quotation,
    showTrigger = true,
}: RejectQuotationProps)
{
    const handleUpdateStatus = () =>
    {
        if (quotation)
        {
            UpdateStatus(quotation.id!, "Rejected");
        }
        onOpenChange(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            { showTrigger ? (
                <AlertDialogTrigger asChild>
                    <Button variant="outline">
                        Rechazar cotización
                    </Button>
                </AlertDialogTrigger>
            ) : null }
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        ¿Esta seguro?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción actualizara el estado de la cotización.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleUpdateStatus}
                    >
                      Continuar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

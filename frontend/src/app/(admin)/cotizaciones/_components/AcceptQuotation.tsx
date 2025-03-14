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

interface AcceptQuotationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotation: components["schemas"]["Quotation2"],
  showTrigger?: boolean;
}

export function AlertDialogAcceptQuotation({
    open,
    onOpenChange,
    quotation,
    showTrigger = true,
}: AcceptQuotationProps)
{
    const handleUpdateStatus = () =>
    {
        if (quotation)
        {
            UpdateStatus(quotation.id!, "Approved");
        }
        UpdateStatus(quotation.id!, "Approved");
        onOpenChange(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            { showTrigger ? (
                <AlertDialogTrigger asChild>
                    <Button variant="outline">
                        Aceptar cotización
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

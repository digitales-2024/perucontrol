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
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { ScrollArea } from "@radix-ui/react-scroll-area";

interface AcceptQuotationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotation: components["schemas"]["Quotation2"],
  showTrigger?: boolean;
  disabled?: boolean;
}

export function AlertDialogAcceptQuotation({
    open,
    onOpenChange,
    quotation,
    showTrigger = true,
    disabled,
}: AcceptQuotationProps)
{
    const isMobile = useIsMobile();

    const handleUpdateStatus = () =>
    {
        if (quotation)
        {
            UpdateStatus(quotation.id!, "Approved");
        }
        UpdateStatus(quotation.id!, "Approved");
        onOpenChange(false);
    };

    return isMobile ? (
        <Drawer open={open} onOpenChange={onOpenChange}>
            {showTrigger ? (
                <DrawerTrigger asChild>
                    <Button variant="outline" disabled={disabled}>
                        Aceptar cotización
                    </Button>
                </DrawerTrigger>
            ) : null}
            <ScrollArea className="h-[10vh] px-4">
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>
                            ¿Esta seguro?
                        </DrawerTitle>
                        <DrawerDescription>
                            Esta acción actualizara el estado de la cotización.
                        </DrawerDescription>
                    </DrawerHeader>
                    <DrawerFooter>
                        <DrawerClose className="border py-1 px-4 text-sm">
                            Cancelar
                        </DrawerClose>
                        <Button
                            onClick={handleUpdateStatus}
                            disabled={disabled}
                        >
                            Continuar
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </ScrollArea>
        </Drawer>
    ) : (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            { showTrigger ? (
                <AlertDialogTrigger asChild>
                    <Button variant="outline" disabled={disabled}>
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
                        disabled={disabled}
                    >
                      Continuar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

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
import { Project } from "../types";

interface RejectProjectProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project,
  showTrigger?: boolean;
}

export function AlertDialogRejectProject({
    open,
    onOpenChange,
    project,
    showTrigger = true,
}: RejectProjectProps)
{
    const handleUpdateStatus = () =>
    {
        if (project)
        {
            UpdateStatus(project.id!, "Rejected");
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

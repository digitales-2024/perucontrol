"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { components } from "@/types/api";
import { Trash } from "lucide-react";
import { useState } from "react";
import { DeleteTermsAndConditions } from "../actions";
import { toastWrapper } from "@/types/toasts";

type Term = components["schemas"]["TermsAndConditions"];

export function TermsItem({ term }: {
    term: Term,
})
{
    const [dialogOpen, setDialogOpen] = useState(false);

    const deleteTerm = async() =>
    {
        const response = DeleteTermsAndConditions(term.id!);
        toastWrapper(response, {
            success: "Plantilla de Términos y Condiciones eliminada con éxito",
            loading: "Eliminando...",
        });
    };

    return (
        <>
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            ¿Estás seguro?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará esta plantilla de Términos y Condiciones.
                            <br />
                            Las cotizaciones existentes no se verán afectadas.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={deleteTerm} >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <p className="py-2 px-2 border-t">
                {term.name}
            </p>
            <p className="py-2 overflow-y-hidden max-h-9 border-t">
                {term.content}
            </p>
            <div className="flex items-center justify-center pr-2 border-t">
                <button className="inline-block cursor-pointer hover:bg-gray-200 hover:dark:bg-gray-700 transition-colors rounded p-2" onClick={() => setDialogOpen(true)}>
                    <Trash />
                </button>
            </div>
        </>
    );
}

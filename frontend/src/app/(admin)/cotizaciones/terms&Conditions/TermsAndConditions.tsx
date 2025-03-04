import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { components } from "@/types/api";
import { Trash } from "lucide-react";
import React from "react";
import CreateTermsForm from "./CreateTermsForm";

type TermsAndConditions = components["schemas"]["TermsAndConditions"];

export default function TermsAndConditions({
    open,
    setOpen,
    termsAndConditions,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  termsAndConditions: Array<TermsAndConditions>;
})
{
    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                          Plantillas de Términos y Condiciones
                        </DialogTitle>
                        <DialogDescription>
                          Agrega, edita o elimina terminos y condiciones
                        </DialogDescription>
                    </DialogHeader>

                    <div className="border rounded-xl grid grid-cols-[10rem_auto_2rem] max-h-48 overflow-y-scroll">
                        <p className="text-muted-foreground py-2 px-2">
                          Nombre
                        </p>
                        <p className="text-muted-foreground py-2">
                          Plantilla
                        </p>
                        <div />

                        {termsAndConditions.map((term, idx) => (
                            <React.Fragment key={term.id ?? idx}>
                                <p className="py-2 px-2 border-t">
                                    {term.name}
                                </p>
                                <p className="py-2 overflow-y-hidden max-h-9 border-t">
                                    {term.content}
                                </p>
                                <div className="flex items-center justify-center pr-2 border-t">
                                    <Trash />
                                </div>
                            </React.Fragment>
                        ))}
                    </div>

                    <div className="pt-4">
                        <h3 className="font-bold text-lg">
                          Crear nueva plantilla
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Ingrese el nombre y condiciones de la plantilla
                        </p>
                        <CreateTermsForm onClose={setOpen} />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

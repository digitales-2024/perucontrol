"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Trash } from "lucide-react";
import { useState } from "react";

export function CreateCotizacion()
{
    const [termsOpen, setTermsOpen] = useState(false);

    return (
        <div>
            <TermsAndConditions open={termsOpen} setOpen={setTermsOpen} />
            <Sheet>
                <SheetTrigger asChild>
                    <Button>
                        Nueva cotización
                    </Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle className="text-xl">
                            Nueva cotización
                        </SheetTitle>
                        <SheetDescription>
                            Agrega una nueva cotización.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="px-4">
                        <h3>
                            Términos y Condiciones
                        </h3>
                        <div className="grid grid-cols-2">
                            <div>
                                --selector--
                            </div>
                            <div className="text-right">
                                <Button variant="secondary" onClick={() => setTermsOpen(true)}>
                                    Plantillas de T&C
                                </Button>
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}

function TermsAndConditions({ open, setOpen }: { open: boolean, setOpen: (v: boolean) => void })
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

                        <p className="py-2 px-2 border-t">
                            Plantilla 1
                        </p>
                        <p className="py-2 overflow-y-hidden max-h-9 border-t">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                        </p>
                        <div className="flex items-center justify-center pr-2 border-t">
                            <Trash />
                        </div>

                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

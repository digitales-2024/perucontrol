"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CreateTermsAndConditions } from "./actions";
import { toastWrapper } from "@/types/toasts";
import { components } from "@/types/api";

type TermsAndConditions = components["schemas"]["TermsAndConditions"];

export function CreateQuotation({ termsAndConditions }: { termsAndConditions: Array<TermsAndConditions> })
{
    const [termsOpen, setTermsOpen] = useState(false);

    return (
        <div>
            <TermsAndConditions
                open={termsOpen}
                setOpen={setTermsOpen}
                termsAndConditions={termsAndConditions}
            />
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

function TermsAndConditions({
    open,
    setOpen,
    termsAndConditions,
}: {
    open: boolean,
    setOpen: (v: boolean) => void,
    termsAndConditions: Array<TermsAndConditions>,
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

const createTermsSchema = z.object({
    name: z.string().min(2, { message: "El nombre no puede estar vacio" })
        .max(100),
    terms: z.string().min(2, { message: "Los terminos no pueden estar vacios" }),
});
type CreateTermsSchema = z.infer<typeof createTermsSchema>

function CreateTermsForm({ onClose }: { onClose: (v: boolean) => void })
{
    const form = useForm<CreateTermsSchema>({
        resolver: zodResolver(createTermsSchema),
        defaultValues: {
            name: "",
            terms: "",
        },
    });

    async function onSubmit(values: CreateTermsSchema)
    {
        const promise = CreateTermsAndConditions({
            name: values.name,
            content: values.terms,
        });

        toastWrapper(promise, {
            success: "Términos y Condiciones creados con éxito",
            loading: "Creando...",
        });

        await promise;

        form.reset();
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 pt-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Nombre de la plantilla
                            </FormLabel>
                            <FormControl>
                                <Input placeholder="Nombre de la plantilla" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="terms"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Terminos
                            </FormLabel>
                            <FormControl>
                                <Textarea rows={4} placeholder="Términos y condiciones" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <Button type="submit">
                        Crear Plantilla
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => onClose(false)}>
                        Cancelar
                    </Button>
                </div>
            </form>
        </Form>
    );
}

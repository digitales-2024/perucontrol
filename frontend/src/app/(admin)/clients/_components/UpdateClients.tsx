import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema, CreateClientSchema } from "../schemas";
import { UpdateClient } from "../actions";
import { toastWrapper } from "@/types/toasts";
import { components } from "@/types/api";

interface UpdateClientProps {
    client: components["schemas"]["LegacyClient"];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function UpdateClientSheet({ client, open, onOpenChange }: UpdateClientProps)
{
    const [typeDocument, setTypeDocument] = useState("");

    const form = useForm<CreateClientSchema>({
        resolver: zodResolver(clientSchema),
        defaultValues: {
            typeDocument: client.typeDocument ?? "",
            typeDocumentValue: client.typeDocumentValue ?? "",
            razonSocial: client.razonSocial ?? "",
            businessType: client.businessType ?? "",
            name: client.name ?? "",
            fiscalAddress: client.fiscalAddress ?? "",
            email: client.email ?? "",
            contactName: client.contactName ?? "",
            clientLocations: client.clientLocations ?? [{ address: "" }],
            phoneNumber: client.phoneNumber ?? "",
        },
    });

    const { reset } = form;

    // Add this after your existing form fields, before the SheetFooter
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "clientLocations",
    });

    useEffect(() =>
    {
        if (open)
        {
            form.reset({
                typeDocument: client.typeDocument ?? "",
                typeDocumentValue: client.typeDocumentValue ?? "",
                razonSocial: client.razonSocial ?? "",
                businessType: client.businessType ?? "",
                name: client.name ?? "",
                fiscalAddress: client.fiscalAddress ?? "",
                email: client.email ?? "",
                contactName: client.contactName ?? "",
                clientLocations: client.clientLocations ?? [{ address: "" }],
                phoneNumber: client.phoneNumber ?? "",
            });

            setTypeDocument(client.typeDocument ?? "");
        }
    }, [open, client, form]);

    const onSubmit = async(input: CreateClientSchema) =>
    {
        const [, err] = await toastWrapper(UpdateClient(client.id!, input), {
            loading: "Cargando...",
            success: "¡Cliente actualizado exitosamente!",
        });
        if (err !== null)
        {
            return;
        }
        reset();
        onOpenChange(false);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md md:max-w-lg p-0 overflow-hidden">
                <SheetHeader>
                    <SheetTitle>
                        Actualizar Cliente
                    </SheetTitle>
                    <SheetDescription>
                        Llena todos los campos para actualizar el cliente
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="max-h-[85vh] overflow-y-auto px-2">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                            <div className="mx-4 grid gap-3">

                                {/* Tipo de documento */}
                                <FormField
                                    control={form.control}
                                    name="typeDocument"
                                    render={({ field }) => (
                                        <FormItem className="truncate">
                                            <FormLabel>
                                                Tipo de documento
                                            </FormLabel>
                                            <Select
                                                disabled value={field.value} onValueChange={(value) =>
                                                {
                                                    field.onChange(value);
                                                    setTypeDocument(value);
                                                }}
                                            >
                                                <FormControl className="mb-0">
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione el tipo de documento" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="ruc">
                                                        RUC
                                                    </SelectItem>
                                                    <SelectItem value="dni">
                                                        DNI
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />

                                {/* Campos condicionales */}
                                {typeDocument === "ruc" && (
                                    <>
                                        <FormField
                                            control={form.control}
                                            name="typeDocumentValue"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        RUC
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="flex gap-2">
                                                            <Input disabled placeholder="Ingrese el RUC" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="razonSocial"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Razón Social
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Ingrese la razón social" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Nombre Comercial
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Ingrese el nombre comercial" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="contactName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Nombre de Contacto
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Ingrese el nombre de contacto" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </>
                                )}

                                {typeDocument === "dni" && (
                                    <>
                                        {/* DNI */}
                                        <FormField
                                            control={form.control}
                                            name="typeDocumentValue"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        DNI
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input disabled placeholder="Ingrese el DNI" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Nombre */}
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Nombres y Apellidos
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Ingrese los nombres y apellidos" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </>
                                )}

                                {/* Dirección Principal */}
                                <FormField
                                    control={form.control}
                                    name="fiscalAddress"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Dirección
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Dirección" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Campo de Teléfono */}
                                <FormField
                                    control={form.control}
                                    name="phoneNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel htmlFor="phoneNumber">
                                                Teléfono
                                            </FormLabel>
                                            <FormControl>
                                                <Input id="phone" placeholder="Ingrese el número de teléfono" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Campo de Correo Electrónico */}
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel htmlFor="email">
                                                Correo Electrónico
                                            </FormLabel>
                                            <FormControl>
                                                <Input id="email" placeholder="Ingrese el correo electrónico" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* Direcciones Adicionales */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Button type="button" variant="outline" size="sm" className="mt-2 w-full" onClick={() => append({ address: "" })}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Agregar dirección
                                        </Button>
                                    </div>

                                    {fields.map((field, index) => (
                                        <div key={field.id} className="flex gap-2">
                                            <FormField
                                                control={form.control}
                                                name={`clientLocations.${index}.address`}
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormControl>
                                                            <Input placeholder={`Dirección secundaria ${index}`} {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Button type="button" variant="ghost" size="icon" className="h-10 w-10" onClick={() => remove(index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <SheetFooter>
                                <Button type="submit">
                                    Guardar
                                </Button>
                            </SheetFooter>
                        </form>
                    </Form>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}

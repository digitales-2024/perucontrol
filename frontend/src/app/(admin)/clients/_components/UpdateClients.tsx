import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Plus, Search, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema, CreateClientSchema } from "../schemas";
import { toast } from "sonner";
import { SearchClientByRuc, UpdateClient } from "../actions";
import { Client } from "../types/clients";

interface UpdateClientProps {
    client: Client;
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
            clientLocations: client.clientLocations ?? [{ address: "" }],
            phoneNumber: client.phoneNumber ?? "",
        },
    });

    const { reset, setValue } = form;

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
                clientLocations: client.clientLocations ?? [{ address: "" }],
                phoneNumber: client.phoneNumber ?? "",
            });

            setTypeDocument(client.typeDocument ?? "");
        }
    }, [open, client, form]);

    const handleSearchByRuc = async(ruc: string) =>
    {
        const result = await SearchClientByRuc(ruc);
        if (result)
        {
            const data = result;
            // Actualiza los campos del formulario con los datos obtenidos
            setValue("razonSocial", data[0].razonSocial ?? "");
            setValue("name", data[0].name ?? "");
            setValue("fiscalAddress", data[0].fiscalAddress ?? "");
        }
        else
        {
            console.error("Error searching client by RUC:", result);
        }
    };

    const onSubmit = async(input: CreateClientSchema) =>
    {
        const result = UpdateClient(client.id, input);
        toast.promise(result, {
            loading: "Cargando...",
            success: "¡Cliente actualizado exitosamente!",
            error: "Error",
        });

        reset();
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>
                        Actualizar Cliente
                    </SheetTitle>
                    <SheetDescription>
                        Llena todos los campos para actualizar el cliente
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="max-h-[90vh] h-full overflow-y-auto">
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
                                            <Select value={field.value} onValueChange={(value) =>
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
                                                            <Input placeholder="Ingrese el RUC" {...field} />
                                                            <Button type="button" className="px-3" onClick={() => handleSearchByRuc(field.value)}>
                                                                <Search />
                                                            </Button>
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
                                                        <Input placeholder="Ingrese el DNI" {...field} />
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

                                {/* Giro del negocio */}
                                <FormField
                                    control={form.control}
                                    name="businessType"
                                    render={({ field }) => (
                                        <FormItem className="truncate">
                                            <FormLabel>
                                                Giro del Negocio
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Giro del Negocio" {...field} />
                                            </FormControl>
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
                                <SheetClose asChild>
                                    <Button type="submit">
                                        Guardar
                                    </Button>
                                </SheetClose>
                            </SheetFooter>
                        </form>
                    </Form>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}

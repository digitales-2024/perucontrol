import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Plus, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet ,SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema, CreateClientSchema } from "../schemas";
import { registerClient, searchClientByRuc } from "../actions";
import { toast } from "sonner";

export const CreateClient = () =>
{
    const [typeDocument, setTypeDocument] = useState("");

    const form = useForm<CreateClientSchema>({
        resolver: zodResolver(clientSchema),
        defaultValues: {
            typeDocument: "",
            typeDocumentValue: "",
            razonSocial: "",
            businessType: "",
            name: "",
            fiscalAddress: "",
            email: "",
            clientLocations: [
                {
                    address: "",
                },
            ],
            phoneNumber: "",
        },
    });

    const { reset, setValue } = form;

    const handleSearchByRuc = async(ruc: string) =>
    {
        const result = await searchClientByRuc(ruc);
        if (result)
        {
            const data = result;
            // Actualiza los campos del formulario con los datos obtenidos
            setValue("razonSocial", data[0].razonSocial || "");
            setValue("name", data[0].name || "");
            setValue("fiscalAddress", data[0].fiscalAddress || "");
        }
        else
        {
            console.error("Error searching client by RUC:", result);
        }
    };

    const onSubmit = async(input: CreateClientSchema) =>
    {
        const result = registerClient(input);
        toast.promise(result, {
            loading: "Loading...",
            success: "Client registered successfully!",
            error: "Error",
        });

        reset();
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button className="w-28 text-xs">
                    <Plus />
                              Crear Nuevo
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>
                                Nuevo Cliente
                    </SheetTitle>
                    <SheetDescription>
                              Llena todos los campos para crear un nuevo cliente
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="max-h-[85vh] h-full">
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
                                            <Select onValueChange={(value) =>
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
                                            <Select onValueChange={field.onChange}>
                                                <FormControl className="mb-0">
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione el giro del negocio" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="giro1">
                                                                Giro 1
                                                    </SelectItem>
                                                    <SelectItem value="giro2">
                                                                Giro 2
                                                    </SelectItem>
                                                    <SelectItem value="giro3">
                                                                Giro 3
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
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
                                                <Input
                                                    id="phone"
                                                    placeholder="Ingrese el número de teléfono"
                                                    {...field}
                                                />
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
                                                <Input
                                                    id="email"
                                                    placeholder="Ingrese el correo electrónico"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
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
};

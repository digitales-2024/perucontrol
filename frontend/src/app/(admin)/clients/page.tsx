"use client";

import { HeaderPage } from "@/components/common/HeaderPage";
import { Shell } from "@/components/common/Shell";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet ,SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { clientSchema, CreateClientSchema } from "./schemas";
import { registerClient } from "./actions";
import { toast } from "sonner";

export default function ClientsPage()
{
    const form = useForm<CreateClientSchema>({
        resolver: zodResolver(clientSchema),
        defaultValues: {
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

    const onSubmit = async(input: CreateClientSchema) =>
    {
        const result = registerClient(input);
        toast.promise(result, {
            loading: "Loading...",
            success: "Client registered successfully!",
            error: "Error",
        });
        // const [, error] = result;
        // if (error)
        // {
        //     toast.error("Error registering client:");
        //     return;
        // }
        // else
        // {
        //     toast.success("Client registered successfully!");
        // }
    };

    return (
        <Shell>
            <HeaderPage title="Gestión de clientes" description="Gestiona los clientes de tu empresa" />
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

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="mx-4 grid gap-4">
                                {/* Razon Social */}
                                <FormField
                                    control={form.control}
                                    name="razonSocial"
                                    render={({ field }) => (
                                        <FormItem className="truncate">
                                            <FormLabel>
                                              Razon Social
                                            </FormLabel>
                                            <Select onValueChange={field.onChange}>
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

                                {/* Nombre */}
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Nombre
                                            </FormLabel>
                                            <FormControl>
                                                <Input id="name" placeholder="Nombre" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

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
                </SheetContent>
            </Sheet>
        </Shell>
    );
}

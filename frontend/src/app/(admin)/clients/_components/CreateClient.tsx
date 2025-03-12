import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Loader, Plus, Search, Trash2 } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema, CreateClientSchema } from "../schemas";
import { RegisterClient, SearchClientByRuc } from "../actions";
import { toastWrapper } from "@/types/toasts";

export const CreateClient = () =>
{
    const [typeDocument, setTypeDocument] = useState("");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

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

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "clientLocations",
    });

    const handleSearchByRuc = async(ruc: string) =>
    {
        setLoading(true);
        const [data, error] = await SearchClientByRuc(ruc);
        if (error !== null)
        {
            console.error("Error searching client by RUC:", error);
        }

        // Actualiza los campos del formulario con los datos obtenidos
        setValue("razonSocial", data.razonSocial ?? "");
        setValue("name", data.name ?? "");
        setValue("fiscalAddress", data.fiscalAddress ?? "");
        setValue("businessType", data.businessType ?? "");

        setLoading(false);
    };

    const onSubmit = async(input: CreateClientSchema) =>
    {
        const [, error] = await toastWrapper(RegisterClient(input), {
            loading: "Cargando...",
            success: "Cliente registrado exitosamente!",
        });
        if (error !== null)
        {
            return;
        }

        reset();
        setOpen(false);
    };

    useEffect(() =>
    {
        if (!open) reset();
        setTypeDocument("");
    }, [open, reset]);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
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

                <ScrollArea className="max-h-[85vh] h-full overflow-y-auto">
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
                                                            <Button type="button" className="px-3" onClick={() => handleSearchByRuc(field.value)} disabled={loading}>
                                                                {loading ? <Loader className="animate-spin" /> : <Search />}
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
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Button type="button" variant="outline" size="sm" className="mt-2 w-full" onClick={() => append({ address: "" })}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Agregar dirección
                                        </Button>
                                    </div>

                                    {fields.map((field, index) => (
                                        <div key={field.id} className="flex gap-2">
                                            {index > 0 && (
                                                <>
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

                                                </>
                                            )}
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
};

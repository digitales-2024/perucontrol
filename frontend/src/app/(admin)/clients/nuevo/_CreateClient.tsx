"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Loader, Plus, Search, Trash2 } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SheetFooter } from "@/components/ui/sheet";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema, type CreateClientSchema } from "../schemas";
import { RegisterClient, SearchClientByRuc } from "../actions";
import { toastWrapper } from "@/types/toasts";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const CreateClient = () =>
{
    const [typeDocument, setTypeDocument] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

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
            contactName: "",
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

        const [data, error] = await toastWrapper(SearchClientByRuc(ruc), {
            loading: "Buscando información del RUC...",
            success: "Información encontrada y cargada exitosamente",
        });

        if (error !== null)
        {
            console.error("Error searching client by RUC:", error);
            setLoading(false);
            return;
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
        router.push("/clients");
    };

    return (
        <div className="mt-5">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-2"
                >
                    <div className="mx-4 grid gap-3">
                        <h3 className="text-lg font-bold mt-4">
                            Información del Cliente
                        </h3>

                        {/* Tipo de documento */}
                        <FormField
                            control={form.control}
                            name="typeDocument"
                            render={({ field }) => (
                                <FormItem className="truncate">
                                    <FormLabel className="text-base">
                                        Tipo de documento
                                        <span className="text-red-500">
                                            *
                                        </span>
                                    </FormLabel>
                                    <Select
                                        onValueChange={(value) =>
                                        {
                                            field.onChange(value);
                                            setTypeDocument(value);
                                        }}
                                        value={field.value}
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
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Campos condicionales */}
                        {typeDocument === "ruc" && (
                            <>
                                <Card className="border-2 border-blue-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/30">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <Search className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg font-semibold text-blue-900">
                                                    Búsqueda por RUC
                                                </CardTitle>
                                                <p className="text-sm text-blue-700 mt-1">
                                                    Ingrese el RUC para
                                                    autocompletar la información
                                                </p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <FormField
                                            control={form.control}
                                            name="typeDocumentValue"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-base">
                                                        RUC
                                                        {" "}
                                                        <span className="text-red-500">
                                                            *
                                                        </span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="flex gap-3">
                                                            <div className="relative flex-1">
                                                                <Input
                                                                    placeholder="Ingrese el RUC (11 dígitos)"
                                                                    {...field}
                                                                    className="pl-10 h-12 text-base border-2 focus:border-blue-400"
                                                                />
                                                                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                size="lg"
                                                                className="px-6 h-12 bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200"
                                                                onClick={() => handleSearchByRuc(field.value)
                                                                }
                                                                disabled={
                                                                    loading ||
																	!field.value ||
																	field.value
																	    .length !==
																		11
                                                                }
                                                            >
                                                                {loading ? (
                                                                    <>
                                                                        <Loader className="h-4 w-4 animate-spin mr-2" />
                                                                        Buscando...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Search className="h-4 w-4 mr-2" />
                                                                        Buscar
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                    {field.value &&
														field.value.length >
															0 &&
														field.value.length !==
															11 && (
                                                        <p className="text-sm text-amber-600 mt-1">
                                                            El RUC debe
                                                            tener
                                                            exactamente 11
                                                            dígitos
                                                        </p>
                                                    )}
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                                <FormField
                                    control={form.control}
                                    name="razonSocial"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base">
                                                Razón Social
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ingrese la razón social"
                                                    {...field}
                                                />
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
                                            <FormLabel className="text-base">
                                                Giro del Negocio
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Giro del Negocio"
                                                    {...field}
                                                />
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
                                            <FormLabel className="text-base">
                                                Nombre Comercial
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ingrese el nombre comercial"
                                                    {...field}
                                                />
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
                                            <FormLabel className="text-base">
                                                Nombre de Contacto
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ingrese el nombre de contacto"
                                                    {...field}
                                                />
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
                                            <FormLabel className="text-base">
                                                DNI
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ingrese el DNI"
                                                    {...field}
                                                />
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
                                            <FormLabel className="text-base">
                                                Nombres y Apellidos
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ingrese los nombres y apellidos"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}

                        <hr />

                        <h3 className="text-lg font-bold">
                            Contacto y Dirección
                        </h3>

                        {/* Dirección Principal */}
                        <FormField
                            control={form.control}
                            name="fiscalAddress"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base">
                                        Dirección Principal
                                        <span className="text-red-500">
                                            *
                                        </span>
                                    </FormLabel>
                                    <FormDescription>
                                        Dirección fiscal o principal del cliente
                                    </FormDescription>
                                    <FormControl>
                                        <Input
                                            placeholder="Av. / Jr. / Calle Nro. Lt."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Campo de Teléfono */}
                            <FormField
                                control={form.control}
                                name="phoneNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base">
                                            Teléfono
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
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
                                        <FormLabel className="text-base">
                                            Correo Electrónico
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ingrese el correo electrónico"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <hr />

                        <h3 className="text-lg font-bold mt-4">
                            Direcciones Adicionales
                        </h3>

                        <FormDescription>
                            Agregue direcciones adicionales donde el cliente
                            pueda recibir servicios
                        </FormDescription>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => append({ address: "" })}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar dirección
                        </Button>

                        {fields.map((field, index) => (
                            <div key={field.id}>
                                {index > 0 && (
                                    <div className="flex gap-2">
                                        <FormField
                                            control={form.control}
                                            name={`clientLocations.${index}.address`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl>
                                                        <Input
                                                            placeholder={`Dirección adicional ${index}`}
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-10 w-10 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                            onClick={() => remove(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <SheetFooter>
                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                            Guardar
                        </Button>
                    </SheetFooter>
                </form>
            </Form>
        </div>
    );
};

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Loader,
    Plus,
    Search,
    Trash2,
    Building2,
    Phone,
    Mail,
    MapPin,
    User,
    FileText,
} from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { SheetFooter } from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { toastWrapper } from "@/types/toasts";
import { useRouter } from "next/navigation";
import { SearchClientByRuc } from "@/app/(admin)/clients/actions";
import {
    type CreateSupplierSchema,
    supplierSchema,
} from "../../../_schemas/createSuppliersSchema";
import { RegisterSupplier } from "../../../_actions/SupplierActions";

export const CreateSupplier = () =>
{
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const form = useForm<CreateSupplierSchema>({
        resolver: zodResolver(supplierSchema),
        defaultValues: {
            rucNumber: "",
            businessName: "",
            businessType: "",
            name: "",
            fiscalAddress: "",
            email: "",
            contactName: "",
            supplierLocations: [
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
        name: "supplierLocations",
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
            console.error("Error searching supplier by RUC:", error);
            setLoading(false);
            return;
        }

        setValue("businessName", data.razonSocial ?? "");
        setValue("name", data.name ?? "");
        setValue("fiscalAddress", data.fiscalAddress ?? "");
        setValue("businessType", data.businessType ?? "");

        setLoading(false);
    };

    const onSubmit = async(input: CreateSupplierSchema) =>
    {
        const [, error] = await toastWrapper(RegisterSupplier(input), {
            loading: "Cargando...",
            success: "Proveedor registrado exitosamente!",
        });
        if (error !== null)
        {
            return;
        }

        reset();
        router.push("/suppliers");
    };

    return (
        <div className="mt-5">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    <div className="mx-4 space-y-6">
                        {/* SECCIÓN DE BÚSQUEDA RUC - DESTACADA */}
                        <Card className="border-2 border-blue-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/30">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Search className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-bold text-blue-900">
                                            Búsqueda por RUC
                                        </CardTitle>
                                        <p className="text-sm text-blue-700 mt-1">
                                            Ingrese el RUC para autocompletar la
                                            información
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="rucNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">
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
															    .length !== 11
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
												field.value.length > 0 &&
												field.value.length !== 11 && (
<p className="text-sm text-amber-600 mt-1">
                                                    El RUC debe tener
                                                    exactamente 11 dígitos
													</p>
                                            )}
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* INFORMACIÓN BÁSICA DEL PROVEEDOR */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-gray-600" />
                                    <CardTitle className="text-lg font-bold">
                                        Información del Proveedor
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="businessName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-medium flex items-center gap-2">
                                                    <Building2 className="h-4 w-4" />
                                                    Razón Social
                                                    {" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Ingrese la razón social"
                                                        {...field}
                                                        className="h-11"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="businessType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-medium flex items-center gap-2">
                                                    <FileText className="h-4 w-4" />
                                                    Giro del Negocio
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Ej: Comercio, Servicios, Manufactura"
                                                        {...field}
                                                        className="h-11"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Separator />

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-medium flex items-center gap-2">
                                                    <Building2 className="h-4 w-4" />
                                                    Nombre Comercial
                                                    {" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Ingrese el nombre comercial"
                                                        {...field}
                                                        className="h-11"
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
                                                <FormLabel className="text-base font-medium flex items-center gap-2">
                                                    <User className="h-4 w-4" />
                                                    Nombre de Contacto
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Ingrese el nombre de contacto"
                                                        {...field}
                                                        className="h-11"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* CONTACTO Y DIRECCIÓN */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-gray-600" />
                                    <CardTitle className="text-lg font-bold">
                                        Contacto y Dirección
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <FormField
                                    control={form.control}
                                    name="fiscalAddress"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-medium flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                Dirección Principal
                                                {" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </FormLabel>
                                            <FormDescription className="text-sm">
                                                Dirección fiscal o principal del
                                                proveedor
                                            </FormDescription>
                                            <FormControl>
                                                <Input
                                                    placeholder="Av. / Jr. / Calle Nro. Lt."
                                                    {...field}
                                                    className="h-11"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Separator />

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="phoneNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-medium flex items-center gap-2">
                                                    <Phone className="h-4 w-4" />
                                                    Teléfono
                                                    {" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Ingrese el número de teléfono"
                                                        {...field}
                                                        className="h-11"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-medium flex items-center gap-2">
                                                    <Mail className="h-4 w-4" />
                                                    Correo Electrónico
                                                    {" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="ejemplo@empresa.com"
                                                        {...field}
                                                        className="h-11"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* DIRECCIONES ADICIONALES */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-gray-600" />
                                        <div>
                                            <CardTitle className="text-lg font-bold">
                                                Direcciones Adicionales
                                            </CardTitle>
                                            <FormDescription className="mt-1">
                                                Agregue direcciones adicionales
                                                donde el proveedor pueda recibir
                                                correspondencia
                                            </FormDescription>
                                        </div>
                                    </div>
                                    {fields.length > 0 && (
                                        <Badge
                                            variant="secondary"
                                            className="ml-2"
                                        >
                                            {fields.length}
                                            {" "}
                                            {fields.length === 1
                                                ? "dirección"
                                                : "direcciones"}
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="lg"
                                    className="w-full h-12 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                                    onClick={() => append({ address: "" })}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Agregar nueva dirección
                                </Button>

                                {fields.length > 0 && (
                                    <div className="space-y-3 mt-4">
                                        {fields.map((field, index) => (
                                            <div
                                                key={field.id}
                                                className="relative"
                                            >
                                                <div className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg border">
                                                    <div className="flex-shrink-0 mt-2">
                                                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <span className="text-xs font-medium text-blue-600">
                                                                {index + 1}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <FormField
                                                        control={form.control}
                                                        name={`supplierLocations.${index}.address`}
                                                        render={({ field }) => (
                                                            <FormItem className="flex-1">
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder={`Dirección adicional ${
                                                                            index +
																			1
                                                                        }`}
                                                                        {...field}
                                                                        className="bg-white h-11 border-gray-200"
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
                                                        className="h-11 w-11 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                                                        onClick={() => remove(index)
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <SheetFooter className="px-4">
                        <Button
                            type="submit"
                            size="lg"
                            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-medium shadow-md hover:shadow-lg transition-all duration-200"
                        >
                            Guardar Proveedor
                        </Button>
                    </SheetFooter>
                </form>
            </Form>
        </div>
    );
};

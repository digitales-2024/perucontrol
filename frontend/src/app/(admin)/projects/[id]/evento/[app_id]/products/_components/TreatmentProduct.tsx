"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { PlusCircle, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { components } from "@/types/api";
import { AutoComplete, Option } from "@/components/ui/autocomplete";
import { useState, useEffect } from "react";
import {
    TreatmentProductSchema,
    TreatmentProductFormValues,
} from "@/app/(admin)/projects/schemas";
import { toastWrapper } from "@/types/toasts";
import { CreateTreatmentProduct } from "@/app/(admin)/projects/actions";

type Product = components["schemas"]["ProductGetAllOutputDTO"];

export function TreatmentProductForm({
    products,
    appointmentId,
    treatmentProducts,
}: {
  products: Array<Product>;
  appointmentId: string;
  treatmentProducts: Array<components["schemas"]["TreatmentProductDTO"]>;
})
{
    const [productSolventsOptionsMap, setProductSolventsOptionsMap] = useState<Record<number, Array<Option>>>({});

    // Filtrando los productos activos
    const activeProducts = products.filter((product) => product.isActive);

    // Creando opciones para AutoComplete
    const productsOptions: Array<Option> =
        activeProducts?.map((product) => ({
            value: product.id ?? "",
            label: product.name ?? "-",
        })) ?? [];

    // Inicializar el mapa de opciones de concentración para los productos existentes
    useEffect(() =>
    {
        if (treatmentProducts.length > 0)
        {
            const initialSolventsMap: Record<number, Array<Option>> = {};
            treatmentProducts.forEach((tp, index) =>
            {
                const product = products.find((p) => p.id === tp.product.id);
                if (product)
                {
                    const concentrationOptions = product.productAmountSolvents.map((solvent) => ({
                        value: solvent.id,
                        label: solvent.amountAndSolvent,
                    }));
                    initialSolventsMap[index] = concentrationOptions;
                }
            });
            setProductSolventsOptionsMap(initialSolventsMap);
        }
    }, [treatmentProducts, products]);

    // inicializa el form con los datos existentes o un objeto vacío
    const form = useForm<TreatmentProductFormValues>({
        resolver: zodResolver(TreatmentProductSchema),
        defaultValues: {
            products: treatmentProducts.length > 0
                ? treatmentProducts.map((tp) => ({
                    id: tp.id,
                    productId: tp.product.id,
                    productAmountSolventId: tp.productAmountSolventId,
                    equipmentUsed: tp.equipmentUsed,
                    appliedTechnique: tp.appliedTechnique,
                    appliedService: tp.appliedService,
                    appliedTime: tp.appliedTime,
                }))
                : [{
                    id: null,
                    productId: "",
                    productAmountSolventId: "",
                    equipmentUsed: null,
                    appliedTechnique: null,
                    appliedService: null,
                    appliedTime: null,
                }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        name: "products",
        control: form.control,
    });

    const onSubmit = async(data: TreatmentProductFormValues) =>
    {
        const [, error] = await toastWrapper(
            CreateTreatmentProduct(appointmentId, data.products),
            {
                loading: "Guardando productos...",
                success: "Productos guardados",
                error: (e) => `Error: ${e.message}`,
            },
        );
        if (error !== null)
        {
            return;
        }
    };

    const handleProductChange = (option: Option | null, index: number) =>
    {
        if (option)
        {
            const selectedProduct = products.find((product) => product.id === option.value);
            if (selectedProduct)
            {
                form.setValue(`products.${index}.productId`, selectedProduct.id ?? "");
                const concentrationOptions = selectedProduct.productAmountSolvents.map((solvent) => ({
                    value: solvent.id,
                    label: solvent.amountAndSolvent,
                }));
                setProductSolventsOptionsMap((prev) => ({
                    ...prev,
                    [index]: concentrationOptions,
                }));
                form.setValue(`products.${index}.productAmountSolventId`, "");
            }
        }
        else
        {
            setProductSolventsOptionsMap((prev) => ({
                ...prev,
                [index]: [],
            }));
            form.setValue(`products.${index}.productAmountSolventId`, "");
        }
    };

    return (
        <Card className="mt-5 border shadow-sm">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 py-4 rounded-t-lg">
                <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                    <PlusCircle className="h-5 w-5" />
                    Productos de Tratamiento
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        {fields.map((f, idx) => (
                            <Card
                                key={f.id}
                                className="mb-6 p-6 border shadow-sm relative"
                            >
                                <div className="absolute -top-3 -left-3">
                                    <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
                                        Producto #
                                        {idx + 1}
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap justify-start md:justify-end gap-2 mb-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => append({
                                            id: null,
                                            productId: "",
                                            productAmountSolventId: "",
                                            equipmentUsed: null,
                                            appliedTechnique: null,
                                            appliedService: null,
                                            appliedTime: null,
                                        })
                                        }
                                    >
                                        <PlusCircle className="h-4 w-4" />
                                        Agregar
                                    </Button>
                                    {fields.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => remove(idx)}
                                            className="gap-1"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Eliminar
                                        </Button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Producto */}
                                    <FormField
                                        name={`products.${idx}.productId`}
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-medium">
                                                    Producto
                                                    <span className="text-red-500">
                                                        {" "}
                                                        *
                                                    </span>
                                                </FormLabel>
                                                <FormControl>
                                                    <AutoComplete
                                                        options={productsOptions}
                                                        value={
                                                            productsOptions.find((o) => o.value === field.value) ??
                                                            undefined
                                                        }
                                                        emptyMessage="No se encontraron productos"
                                                        onValueChange={(o) =>
                                                        {
                                                            field.onChange(o?.value ?? "");
                                                            handleProductChange(o, idx);
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Concentración */}
                                    <FormField
                                        name={`products.${idx}.productAmountSolventId`}
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-medium">
                                                    Concentración
                                                    <span className="text-red-500">
                                                        {" "}
                                                        *
                                                    </span>
                                                </FormLabel>
                                                <FormControl>
                                                    <AutoComplete
                                                        options={productSolventsOptionsMap[idx] || []}
                                                        value={
                                                            (productSolventsOptionsMap[idx] || []).find((o) => o.value === field.value) ?? undefined
                                                        }
                                                        emptyMessage="No se encontraron concentraciones"
                                                        onValueChange={(o) => field.onChange(o?.value ?? "")}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Equipo Utilizado */}
                                    <FormField
                                        name={`products.${idx}.equipmentUsed`}
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Equipo Utilizado
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="Pulverizador"
                                                        value={field.value ?? ""}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Técnica Aplicada */}
                                    <FormField
                                        name={`products.${idx}.appliedTechnique`}
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Técnica Aplicada
                                                </FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Ej: Nebulización" value={field.value ?? ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Servicio Aplicado */}
                                    <FormField
                                        name={`products.${idx}.appliedService`}
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Servicio Aplicado
                                                </FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Ej: Desinfección" value={field.value ?? ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Tiempo Aplicado */}
                                    <FormField
                                        name={`products.${idx}.appliedTime`}
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Tiempo Aplicado
                                                </FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="14:40" value={field.value ?? ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </Card>
                        ))}

                        <Separator />

                        <div className="flex flex-wrap gap-2 justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => append({
                                    id: null,
                                    productId: "",
                                    productAmountSolventId: "",
                                    equipmentUsed: null,
                                    appliedTechnique: null,
                                    appliedService: null,
                                    appliedTime: null,
                                })
                                }
                            >
                                <PlusCircle />
                                Agregar otro producto
                            </Button>
                            <Button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Guardar Registro
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

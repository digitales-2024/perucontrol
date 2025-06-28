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
import {
    TreatmentProductSchema,
    TreatmentProductFormValues,
} from "@/app/(admin)/projects/schemas";
import { toastWrapper } from "@/types/toasts";
import { CreateTreatmentProduct } from "@/app/(admin)/projects/actions";
import { ProductSimple } from "../_types/TreatmentProduct";
import { useState } from "react";

export function TreatmentProductForm({
    products,
    appointmentId,
    treatmentProducts,
}: {
    products: Array<ProductSimple>;
    appointmentId: string;
    treatmentProducts: Array<components["schemas"]["TreatmentProductDTO"]>;
})
{

    console.log("TreatmentProductForm",  JSON.stringify(treatmentProducts, null, 2));
    const [customOptions, setCustomOptions] = useState<Array<string>>([]);
    // Creando opciones para AutoComplete
    const productsOptions: Array<Option> =
    products?.map((product) => ({
        value: product.id ?? "",
        label: product.name ?? "-",
    })) ?? [];

    // inicializa el form con los datos existentes o un objeto vacío
    const form = useForm<TreatmentProductFormValues>({
        resolver: zodResolver(TreatmentProductSchema),
        defaultValues: {
            products: treatmentProducts.length > 0
                ? treatmentProducts.map((tp) => ({
                    id: tp.id,
                    productName: tp.productName, // debe coincidir con el label de productsOptions
                    amountAndSolvent: tp.amountAndSolvent ?? "",
                    activeIngredient: tp.activeIngredient ?? "",
                    equipmentUsed: tp.equipmentUsed ?? "",
                    appliedTechnique: tp.appliedTechnique ?? "",
                    appliedService: tp.appliedService ?? "",
                }))
                : [{
                    id: null,
                    productName: "",
                    amountAndSolvent: "",
                    activeIngredient: "",
                    equipmentUsed: "",
                    appliedTechnique: "",
                    appliedService: "",
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
        if (option && option.label)
        {
            // Si la opción no está en la lista original ni en customOptions, agregarla
            if (
                !products.some((product) => product.name === option.label) &&
                    !customOptions.includes(option.label)
            )
            {
                setCustomOptions((prev) => [...prev, option.label]);
            }

            // 1. Buscar en el formulario actual (por si ya fue editado)
            const formProducts = form.getValues("products");
            const existing = formProducts.find((p, i) => p.productName === option.label && i !== index);
            if (existing && existing.amountAndSolvent)
            {
                form.setValue(`products.${index}.amountAndSolvent`, existing.amountAndSolvent);
            }
            else
            {
                // 2. Buscar en treatmentProducts (datos originales/anteriores)
                const original = treatmentProducts.find((tp) => tp.productName === option.label);
                if (original && original.amountAndSolvent)
                {
                    form.setValue(`products.${index}.amountAndSolvent`, original.amountAndSolvent);
                }
                else
                {
                    // 3. Buscar en la lista original de productos
                    const selectedProduct = products.find((product) => product.name === option.label);
                    if (selectedProduct)
                    {
                        form.setValue(`products.${index}.amountAndSolvent`, selectedProduct.concentration ?? "");
                    }
                    else
                    {
                        // 4. Si no existe, limpiar
                        form.setValue(`products.${index}.amountAndSolvent`, "");
                    }
                }
            }

            form.setValue(`products.${index}.productName`, option.label);
        }
        else
        {
            // Antes de limpiar, guarda el valor actual si es personalizado
            const currentValue = form.getValues(`products.${index}.productName`);
            if (
                currentValue &&
                    !products.some((product) => product.name === currentValue) &&
                    !customOptions.includes(currentValue)
            )
            {
                setCustomOptions((prev) => [...prev, currentValue]);
            }

            // Limpiar producto y concentración
            form.setValue(`products.${index}.amountAndSolvent`, "");
            form.setValue(`products.${index}.productName`, "");
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
                        {fields.map((f, idx) =>
                        {
                            // Obtener los nombres de productos ya seleccionados en otras filas
                            const selectedNames = form.watch("products")
                                .map((p, i) => (i !== idx ? p.productName : null))
                                .filter(Boolean);

                            const customOptionsObjects = customOptions.map((label) => ({ value: label, label }));
                            const allOptions = [...productsOptions, ...customOptionsObjects];

                            const filteredOptions = allOptions.filter((option) => !selectedNames.includes(option.label));

                            return (
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
                                            name={`products.${idx}.productName`}
                                            control={form.control}
                                            render={({ field }) =>
                                            {
                                                let optionsWithCurrent = filteredOptions;
                                                if (
                                                    field.value &&
                                                    !filteredOptions.some((o) => o.label === field.value)
                                                )
                                                {
                                                    optionsWithCurrent = [{ value: field.value, label: field.value }, ...filteredOptions];
                                                }

                                                return (
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
                                                                options={optionsWithCurrent}
                                                                value={optionsWithCurrent.find((o) => o.label === field.value) ?? undefined}
                                                                emptyMessage="No se encontraron productos"
                                                                onValueChange={(o) => handleProductChange(o, idx)}
                                                                allowCustomValue
                                                                placeholder="Nombre del producto"
                                                                inputBordered
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                );
                                            }}
                                        />
                                        {/* Concentración */}
                                        <FormField
                                            name={`products.${idx}.amountAndSolvent`}
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
                                                        <Input
                                                            {...field}
                                                            placeholder="Ej: 10 ml/L"
                                                            value={field.value ?? ""}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Ingrediente Activo */}
                                        <FormField
                                            name={`products.${idx}.activeIngredient`}
                                            control={form.control}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-medium">
                                                        Ingrediente Activo
                                                        <span className="text-red-500">
                                                            {" "}
                                                            *
                                                        </span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="Ej: Cloropicrina"
                                                            value={field.value ?? ""}
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
                                    </div>
                                </Card>
                            );
                        })}

                        <Separator />

                        <div className="flex flex-wrap gap-2 justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => append({
                                    id: null,
                                    productName: "",
                                    amountAndSolvent: "",
                                    activeIngredient: "",
                                    equipmentUsed: "",
                                    appliedTechnique: "",
                                    appliedService: "",
                                })}
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

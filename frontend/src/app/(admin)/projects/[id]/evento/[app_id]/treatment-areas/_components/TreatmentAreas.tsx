"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { PlusCircle, X, Check, ChevronsUpDown } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { treatmentAreaSchema, TreatmentAreaFormValues } from "@/app/(admin)/projects/schemas";
import { components } from "@/types/api";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { toastWrapper } from "@/types/toasts";
import { CreateTreatmentArea } from "@/app/(admin)/projects/actions";

interface TreatmentAreasFormProps {
  treatmentAreas: Array<components["schemas"]["TreatmentAreaGetDTO"]>;
  treatmentProducts: Array<components["schemas"]["TreatmentProductDTO"]>;
  appointmentId: string;
}

export function TreatmentAreasForm({ treatmentAreas, treatmentProducts, appointmentId }: TreatmentAreasFormProps)
{
    const [open, setOpen] = useState<Record<number, boolean>>({});
    const [selectedProducts, setSelectedProducts] = useState<Record<number, Array<{ id: string; name: string }>>>(() =>
    {
        const initialSelectedProducts: Record<number, Array<{ id: string; name: string }>> = {};
        const orderedAreas = [...treatmentAreas].reverse();

        orderedAreas.forEach((area, index) =>
        {
            if (area.productsList && area.productsList.length > 0)
            {
                initialSelectedProducts[index] = area.productsList.map((productId) =>
                {
                    const treatmentProduct = treatmentProducts.find((tp) => tp.id === productId);
                    return {
                        id: productId,
                        name: treatmentProduct?.product.name ?? productId,
                    };
                });
            }
        });
        return initialSelectedProducts;
    });

    // Invertir el orden de los treatmentAreas, empezando por el primero en ser creado
    const orderedTreatmentAreas = [...treatmentAreas].reverse();

    const form = useForm<TreatmentAreaFormValues>({
        resolver: zodResolver(treatmentAreaSchema),
        defaultValues: {
            areas: orderedTreatmentAreas.length > 0
                ? orderedTreatmentAreas.map((ambient) => ({
                    id: ambient.id,
                    observerVector: ambient.observedVector,
                    infestationLevel: ambient.infestationLevel,
                    performedService: ambient.performedService,
                    appliedTechnique: ambient.appliedTechnique,
                    treatmentProductIds: (ambient.productsList ?? []).map((id) => ({ id })),
                }))
                : [{
                    id: null,
                    observerVector: null,
                    infestationLevel: null,
                    performedService: null,
                    appliedTechnique: null,
                    treatmentProductIds: [],
                }],
        },
    });

    const { fields } = useFieldArray({
        control: form.control,
        name: "areas",
    });

    const handleProductSelect = (areaIndex: number, product: { id: string; name: string }) =>
    {
        setSelectedProducts((prev) =>
        {
            const currentProducts = prev[areaIndex] || [];
            const newProducts = [...currentProducts, product];

            // Actualizar el formulario usando setTimeout para evitar el error de renderizado
            setTimeout(() =>
            {
                form.setValue(`areas.${areaIndex}.treatmentProductIds`, newProducts.map((p) => ({ id: p.id })));
            }, 0);

            return { ...prev, [areaIndex]: newProducts };
        });

        setOpen((prev) => ({ ...prev, [areaIndex]: false }));
    };

    const removeProduct = (areaIndex: number, productId: string) =>
    {
        setSelectedProducts((prev) =>
        {
            const currentProducts = prev[areaIndex] || [];
            const newProducts = currentProducts.filter((p) => p.id !== productId);

            // Actualizar el formulario usando setTimeout para evitar cambios de estado durante el renderizado
            setTimeout(() =>
            {
                form.setValue(`areas.${areaIndex}.treatmentProductIds`, newProducts.map((p) => ({ id: p.id })));
            }, 0);

            return { ...prev, [areaIndex]: newProducts };
        });
    };

    const onSubmit = async(data: TreatmentAreaFormValues) =>
    {
        const transformedData = data.areas.map((area) => ({
            id: area.id ?? undefined,
            observedVector: area.observerVector ?? null,
            infestationLevel: area.infestationLevel ?? null,
            performedService: area.performedService ?? null,
            appliedTechnique: area.appliedTechnique ?? null,
            treatmentProductIds: area.treatmentProductIds.map((p) => p.id).filter((id): id is string => id !== null),
        }));

        const [, error] = await toastWrapper(
            CreateTreatmentArea(appointmentId, transformedData),
            {
                loading: "Guardando áreas...",
                success: "Áreas guardadas",
                error: (e) => `Error: ${e.message}`,
            },
        );
        if (error !== null)
        {
            return;
        }
    };

    return (
        <Card className="mt-5 border shadow-sm">
            <CardHeader className="bg-gradient-to-r from-green-600 to-green-800 py-4 rounded-t-lg">
                <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                    <PlusCircle className="h-5 w-5" />
                    Registro de Áreas de Tratamiento
                </CardTitle>
            </CardHeader>

            <CardContent className="p-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {fields.map((field, index) => (
                            <Card key={field.id} className="mb-6 p-6 border shadow-sm relative">
                                <div className="absolute -top-3 -left-3">
                                    <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
                                        Área #
                                        {index + 1}
                                    </Badge>
                                </div>

                                <div className="flex items-center gap-3 mb-6 bg-green-50 p-4 rounded-lg border border-green-100">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="bg-white border-green-200 text-green-700 px-3 py-1 text-base font-semibold">
                                            Ambiente
                                        </Badge>
                                        <span className="text-lg font-medium text-gray-700">
                                            {orderedTreatmentAreas[index].areaName}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name={`areas.${index}.observerVector`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-medium">
                                                    Vector Observado
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="Ej: Mosquitos"
                                                        className="focus-visible:ring-green-500"
                                                        value={field.value ?? ""}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={`areas.${index}.infestationLevel`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-medium">
                                                    Nivel de Infestación
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="Ej: Insignificante"
                                                        className="focus-visible:ring-green-500"
                                                        value={field.value ?? ""}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={`areas.${index}.appliedTechnique`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-medium">
                                                    Técnica Aplicada
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="Ej: Nebulización"
                                                        className="focus-visible:ring-green-500"
                                                        value={field.value ?? ""}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={`areas.${index}.treatmentProductIds`}
                                        render={() => (
                                            <FormItem>
                                                <FormLabel className="font-medium">
                                                    Productos de Tratamiento
                                                    <span className="text-red-500">
                                                        {" "}
                                                        *
                                                    </span>
                                                </FormLabel>
                                                <Popover open={open[index]} onOpenChange={(isOpen) => setOpen((prev) => ({ ...prev, [index]: isOpen }))}>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            aria-expanded={open[index]}
                                                            className="w-full justify-between"
                                                        >
                                                            Seleccionar productos
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent align="start" className="w-full p-0">
                                                        <Command>
                                                            <CommandInput placeholder="Buscar producto..." />
                                                            <CommandEmpty>
                                                                No se encontraron productos.
                                                            </CommandEmpty>
                                                            <CommandGroup>
                                                                {treatmentProducts.map((product) => (
                                                                    <CommandItem
                                                                        key={product.id}
                                                                        onSelect={() => setTimeout(() => handleProductSelect(index, {
                                                                            id: product.id,
                                                                            name: product.product.name,
                                                                        }), 0)}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                selectedProducts[index]?.some((p) => p.id === product.id)
                                                                                    ? "opacity-100"
                                                                                    : "opacity-0",
                                                                            )}
                                                                        />
                                                                        {product.product.name}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                                <div className="mt-2 flex flex-wrap gap-2 md:absolute">
                                                    {selectedProducts[index]?.map((product) => (
                                                        <Badge
                                                            key={product.id}
                                                            variant="secondary"
                                                            className="flex items-center gap-1"
                                                        >
                                                            {product.name}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-4 w-4 p-0 hover:bg-transparent"
                                                                onClick={() => removeProduct(index, product.id)}
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={`areas.${index}.performedService`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-medium">
                                                    Servicio Realizado
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder={"Fumigación \nDesratización"}
                                                        className="resize-none"
                                                        {...field}
                                                        value={field.value ?? ""}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </Card>
                        ))}

                        <Separator className="my-6" />

                        <div className="flex justify-end items-center">
                            <Button
                                type="submit"
                                className="bg-green-600 hover:bg-green-700 px-6 py-2"
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

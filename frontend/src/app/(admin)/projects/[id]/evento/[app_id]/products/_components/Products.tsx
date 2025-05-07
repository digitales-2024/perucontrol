"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { PlusCircle, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Define el schema de validación con Zod
const TreatmentProductSchema = z.object({
    products: z.array(z.object({
        product: z.string().min(1, "El producto es requerido"),
        productConcentration: z.string().min(1, "La concentración es requerida"),
        equipmentUsed: z.string().min(1, "El equipo utilizado es requerido"),
        appliedTechnique: z.string().min(1, "La técnica aplicada es requerida"),
        appliedService: z.string().min(1, "El servicio aplicado es requerido"),
        appliedTime: z.string().min(1, "El tiempo aplicado es requerido"),
    })).min(1, "Debe agregar al menos un producto"),
});

type TreatmentProductFormValues = z.infer<typeof TreatmentProductSchema>;

export function TreatmentProductForm({
    initialData,
}: {
  initialData?: TreatmentProductFormValues;
})
{
    const form = useForm<TreatmentProductFormValues>({
        resolver: zodResolver(TreatmentProductSchema),
        defaultValues: {
            products: initialData?.products?.length
                ? initialData.products
                : [{
                    product: "",
                    productConcentration: "",
                    equipmentUsed: "",
                    appliedTechnique: "",
                    appliedService: "",
                    appliedTime: "",
                }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "products",
    });

    const onSubmit = async(data: TreatmentProductFormValues) =>
    {
        console.log("Formulario enviado:", data);
    // Aquí puedes hacer el fetch para guardar
    };

    return (
        <Card className="mt-5 border shadow-sm ">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 py-4 rounded-t-lg">
                <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                    <PlusCircle className="h-5 w-5" />
                    Registro de Productos de Tratamiento
                </CardTitle>
            </CardHeader>

            <CardContent className="p-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {fields.map((field, index) => (
                            <Card key={field.id} className="mb-6 p-6 border shadow-sm relative">
                                <div className="absolute -top-3 -left-3">
                                    <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
                                        Producto #
                                        {index + 1}
                                    </Badge>
                                </div>

                                <div className="flex justify-end gap-2 mb-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => append({
                                            product: "",
                                            productConcentration: "",
                                            equipmentUsed: "",
                                            appliedTechnique: "",
                                            appliedService: "",
                                            appliedTime: "",
                                        })}
                                        className="gap-1"
                                    >
                                        <PlusCircle className="h-4 w-4" />
                                        Agregar
                                    </Button>

                                    {fields.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => remove(index)}
                                            className="gap-1"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Eliminar
                                        </Button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name={`products.${index}.product`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-medium">
                                                    Producto *
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="Nombre del producto"
                                                        className="focus-visible:ring-blue-500"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={`products.${index}.productConcentration`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-medium">
                                                    Concentración *
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="Ej: 5%, 10mg/L"
                                                        className="focus-visible:ring-blue-500"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={`products.${index}.equipmentUsed`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-medium">
                                                    Equipo Utilizado *
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="Ej: Pulverizador, Nebulizador"
                                                        className="focus-visible:ring-blue-500"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={`products.${index}.appliedTechnique`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-medium">
                                                    Técnica Aplicada *
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="Ej: Nebulización, Aspersión"
                                                        className="focus-visible:ring-blue-500"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={`products.${index}.appliedService`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-medium">
                                                    Servicio Aplicado *
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="Ej: Desinfección, Fumigación"
                                                        className="focus-visible:ring-blue-500"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={`products.${index}.appliedTime`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-medium">
                                                    Tiempo Aplicado *
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="Ej: 15 minutos, 1 hora"
                                                        className="focus-visible:ring-blue-500"
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

                        <div className="flex justify-between items-center">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => append({
                                    product: "",
                                    productConcentration: "",
                                    equipmentUsed: "",
                                    appliedTechnique: "",
                                    appliedService: "",
                                    appliedTime: "",
                                })}
                                className="gap-1"
                            >
                                <PlusCircle className="h-4 w-4" />
                                Agregar otro producto
                            </Button>

                            <Button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 px-6 py-2"
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

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, PlusCircle, Save, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import type { components } from "@/types/api";
import { rodentControlFormSchema, type RodentControlFormValues } from "../schemas";
import { useRouter } from "next/navigation";

export function RodentControlForm({
    onOpenChange,
    project,
}: {
  onOpenChange: (v: boolean) => void
  project: components["schemas"]["ProjectSummarySingle"]
})
{
    console.log("onOpenChange", onOpenChange);
    console.log("Project", project);
    const router = useRouter();

    const form = useForm<RodentControlFormValues>({
        resolver: zodResolver(rodentControlFormSchema),
        defaultValues: {
            rows: [
                {
                    rodentAreas: "",
                    cebaderoTrampa: "",
                    frequency: "",
                    rodentConsumption: "",
                    rodentResult: "",
                    rodentMaterials: "",
                    productName: "",
                    productDose: "",
                    incidencias: "",
                },
            ],
            medidasCorrectivas: "",
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "rows",
    });

    const onSubmit = (data: RodentControlFormValues) =>
    {
        console.log("Datos del formulario:", JSON.stringify(data, null, 2));
    };

    const addRow = () =>
    {
        append({
            rodentAreas: "",
            cebaderoTrampa: "",
            frequency: "",
            rodentConsumption: "",
            rodentResult: "",
            rodentMaterials: "",
            productName: "",
            productDose: "",
            incidencias: "",
        });
    };

    const handleGoBack = () =>
    {
        router.back();
    };

    return (
        <div className="container mx-auto py-6">
            <Button variant="outline" onClick={handleGoBack} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver
            </Button>
            <Card className="border shadow-sm mt-5">
                <CardHeader className="bg-blue-50 py-4">
                    <CardTitle className="text-xl font-semibold text-blue-800">
                        Registro de Control de Roedores
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="flex flex-wrap justify-between items-center mb-4">
                                <h3 className="text-lg font-medium">
                                    Áreas de Control
                                </h3>
                            </div>

                            {fields.map((field, index) => (
                                <Card key={field.id} className="border shadow-sm mb-4">
                                    <CardHeader className="py-2 px-4 bg-gray-50 flex flex-wrap flex-row justify-between items-center">
                                        <CardTitle className="text-base font-medium">
                                            Área #
                                            {index + 1}
                                        </CardTitle>
                                        <div className="flex flex-wrap items-center">
                                            <Button
                                                type="button"
                                                onClick={addRow}
                                                variant="outline"
                                                className="flex items-center gap-2 border-blue-300 text-blue-600"
                                            >
                                                <PlusCircle className="h-4 w-4" />
                                                Agregar Área
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-red-500"
                                                onClick={() => fields.length > 1 && remove(index)}
                                                disabled={fields.length <= 1}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">
                                                    Eliminar
                                                </span>
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4">
                                        <Tabs defaultValue="general" className="w-full">
                                            <TabsList className="flex flex-wrap gap-1 mb-4">
                                                <TabsTrigger value="general">
                                                    Información General
                                                </TabsTrigger>
                                                <TabsTrigger value="details">
                                                    Detalles Técnicos
                                                </TabsTrigger>
                                            </TabsList>

                                            <TabsContent value="general" className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`rows.${index}.rodentAreas`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-sm font-medium">
                                                                    Área Controlada
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Ej: Almacén, Cocina" />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`rows.${index}.cebaderoTrampa`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-sm font-medium">
                                                                    # Trampa / Cebadero
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Ej: T-001, C-002" />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`rows.${index}.frequency`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-sm font-medium">
                                                                    Frecuencia de Realización
                                                                </FormLabel>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Seleccionar frecuencia" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="quincenal">
                                                                            Quincenal
                                                                        </SelectItem>
                                                                        <SelectItem value="mensual">
                                                                            Mensual
                                                                        </SelectItem>
                                                                        <SelectItem value="trimestral">
                                                                            Trimestral
                                                                        </SelectItem>
                                                                        <SelectItem value="semestral">
                                                                            Semestral
                                                                        </SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`rows.${index}.rodentConsumption`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-sm font-medium">
                                                                    Insumo del Cebo
                                                                </FormLabel>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Seleccionar insumo" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="parcial">
                                                                            Parcial
                                                                        </SelectItem>
                                                                        <SelectItem value="consumoTotal">
                                                                            Consumo Total
                                                                        </SelectItem>
                                                                        <SelectItem value="deteriorado">
                                                                            Deteriorado
                                                                        </SelectItem>
                                                                        <SelectItem value="sinConsumo">
                                                                            Sin Consumo
                                                                        </SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                <FormField
                                                    control={form.control}
                                                    name={`rows.${index}.incidencias`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-sm font-medium">
                                                                Incidencias Encontradas
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Textarea
                                                                    {...field}
                                                                    placeholder="Describa las incidencias encontradas"
                                                                    className="min-h-[60px] resize-y"
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </TabsContent>

                                            <TabsContent value="details" className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`rows.${index}.rodentResult`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-sm font-medium">
                                                                    Resultado
                                                                </FormLabel>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Seleccionar resultado" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="activa">
                                                                            Activa
                                                                        </SelectItem>
                                                                        <SelectItem value="inactiva">
                                                                            Inactiva
                                                                        </SelectItem>
                                                                        <SelectItem value="roedMto">
                                                                            ROED MTO
                                                                        </SelectItem>
                                                                        <SelectItem value="otros">
                                                                            Otros
                                                                        </SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`rows.${index}.rodentMaterials`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-sm font-medium">
                                                                    Método Utilizado
                                                                </FormLabel>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Seleccionar método" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="fungicida">
                                                                            Fungicida
                                                                        </SelectItem>
                                                                        <SelectItem value="ceboRaticida">
                                                                            Cebo Raticida
                                                                        </SelectItem>
                                                                        <SelectItem value="trampaPegante">
                                                                            Trampa Pegante
                                                                        </SelectItem>
                                                                        <SelectItem value="jaulaTomahowk">
                                                                            Jaula Tomahowk
                                                                        </SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`rows.${index}.productName`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-sm font-medium">
                                                                    Principio Activo
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`rows.${index}.productDose`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-sm font-medium">
                                                                    Dosis Utilizada
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    </CardContent>
                                </Card>
                            ))}

                            <div className="mt-4">
                                <FormField
                                    control={form.control}
                                    name="medidasCorrectivas"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-medium">
                                                Medidas Correctivas
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    {...field}
                                                    placeholder="Describa las medidas correctivas aplicadas o recomendadas..."
                                                    className="min-h-[100px] resize-y"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex gap-2 justify-end">
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 px-6 py-2">
                                    <Save className="h-4 w-4" />
                                    Guardar
                                </Button>
                                <Button type="submit" className="bg-blue-700 hover:bg-blue-800 flex items-center gap-2 px-6 py-2">
                                    <Save className="h-4 w-4" />
                                    Descargar Word
                                </Button>
                                <Button type="submit" className="bg-green-700 hover:bg-green-800 flex items-center gap-2 px-6 py-2">
                                    <Save className="h-4 w-4" />
                                    Descargar Excel
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

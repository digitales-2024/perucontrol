"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Send } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import type { components } from "@/types/api";
import { useRouter } from "next/navigation";
import { toastWrapper } from "@/types/toasts";
import { RodentControlFormSchema, RodentControlFormValues } from "../schemas";
import { GenerateRodentExcel, GenerateRodentsPDF, SaveRodentData, SendRodentPDFViaEmail, SendRodentPDFViaWhatsapp } from "../actions";
import { DocumentSenderDialog } from "@/components/DocumentSenderDialog";
import { useState } from "react";

export function RodentControlForm({
    project,
    appointment,
    rodent,
}: {
    project: components["schemas"]["ProjectSummarySingle"];
    appointment: components["schemas"]["ProjectAppointmentDTO"];
    rodent: components["schemas"]["RodentRegister"];
})
{
    const router = useRouter();
    const [sendOpen, setSendOpen] = useState(false);

    const form = useForm<RodentControlFormValues>({
        resolver: zodResolver(RodentControlFormSchema),
        defaultValues: {
            serviceDate: rodent.serviceDate ?? null,
            incidents: rodent.incidents ?? null,
            correctiveMeasures: rodent.correctiveMeasures ?? null,
            rodentAreas: rodent.rodentAreas!.length > 0
                ? rodent.rodentAreas?.map((area) => ({
                    name: area.name ?? "",
                    cebaderoTrampa: area.cebaderoTrampa ?? 0,
                    frequency: area.frequency ?? "Fortnightly",
                    rodentConsumption: area.rodentConsumption ?? "Partial",
                    rodentResult: area.rodentResult ?? "Active",
                    rodentMaterials: area.rodentMaterials ?? "Fungicide",
                    productName: area.productName ?? "",
                    productDose: area.productDose ?? "",
                }))
                : [
                    {
                        name: "",
                        cebaderoTrampa: 0,
                        frequency: "Fortnightly",
                        rodentConsumption: "Partial",
                        rodentResult: "Active",
                        rodentMaterials: "Fungicide",
                        productName: "",
                        productDose: "",
                    },
                ],
        },
    });

    const { fields } = useFieldArray({
        control: form.control,
        name: "rodentAreas",
    });

    const onSubmit = async(data: RodentControlFormValues) =>
    {
        await saveData(data);
    };

    const saveData = async(formData: RodentControlFormValues) =>
    {
        const transformedData = {
            ...formData,
            serviceDate: formData.serviceDate ? formData.serviceDate.toString() : null,
        };

        const [, saveError] = await toastWrapper(
            SaveRodentData(appointment.id!, transformedData),
            {
                loading: "Guardando datos...",
                success: "Datos guardados correctamente",
                error: (e) => `Error al guardar los datos: ${e.message}`,
            },
        );

        if (saveError)
        {
            console.error("Error al guardar los datos:", saveError);
            throw new Error("Error al guardar los datos");
        }

        router.refresh();
    };

    const downloadPDF = async() =>
    {
        const [blob, err] = await toastWrapper(GenerateRodentsPDF(appointment.id!), {
            loading: "Generando PDF...",
            success: "PDF generado",
            error: (e) => `Error al generar el PDF: ${e.message}`,
        });

        if (err) return;

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `control-roedores-${project.projectNumber}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const downloadExcel = async() =>
    {
        const [blob, err] = await toastWrapper(GenerateRodentExcel(appointment.id!), {
            loading: "Generando Excel...",
            success: "Excel generado",
            error: (e) => `Error al generar el Excel: ${e.message}`,
        });

        if (err) return;

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `control-roedores-${project.projectNumber}.ods`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleSubmit = async(input: RodentControlFormValues) =>
    {
        const preparedInput = {
            ...input,
            serviceDate: input.serviceDate ? input.serviceDate.toString() : null,
        };

        const [result, error] = await toastWrapper(
            SaveRodentData(appointment.id!, preparedInput),
            {
                loading: "Guardando datos...",
                success: "Datos guardados correctamente",
                error: (e) => `Error al guardar los datos: ${e.message}`,
            },
        );

        if (error)
        {
            console.error("Error al guardar los datos:", error);
            return;
        }

        console.log("Datos guardados exitosamente:", result);
    };

    return (
        <div className="container mx-auto py-6">
            <Card className="border shadow-sm mt-5">
                <CardHeader className="bg-blue-50 py-3">
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
                                                        name={`rodentAreas.${index}.name`}  // Cambiado para apuntar al campo name específico
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-sm font-medium">
                                                                    Área Controlada
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        placeholder="Ej: Almacén, Cocina"
                                                                    />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`rodentAreas.${index}.cebaderoTrampa`}
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
                                                        name={`rodentAreas.${index}.frequency`}
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
                                                                        <SelectItem value="Fortnightly">
                                                                            Quincenal
                                                                        </SelectItem>
                                                                        <SelectItem value="Monthly">
                                                                            Mensual
                                                                        </SelectItem>
                                                                        <SelectItem value="Bimonthly">
                                                                            Bimensual
                                                                        </SelectItem>
                                                                        <SelectItem value="Quarterly">
                                                                            Trimestral
                                                                        </SelectItem>
                                                                        <SelectItem value="Semiannual">
                                                                            Semestral
                                                                        </SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`rodentAreas.${index}.rodentConsumption`}
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
                                                                        <SelectItem value="Partial">
                                                                            Parcial
                                                                        </SelectItem>
                                                                        <SelectItem value="Total">
                                                                            Consumo Total
                                                                        </SelectItem>
                                                                        <SelectItem value="Deteriorated">
                                                                            Deteriorado
                                                                        </SelectItem>
                                                                        <SelectItem value="NoConsumption">
                                                                            Sin Consumo
                                                                        </SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                            </TabsContent>

                                            <TabsContent value="details" className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`rodentAreas.${index}.rodentResult`}
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
                                                                        <SelectItem value="Active">
                                                                            Activa
                                                                        </SelectItem>
                                                                        <SelectItem value="Inactive">
                                                                            Inactiva
                                                                        </SelectItem>
                                                                        <SelectItem value="RoedMto">
                                                                            ROED MTO
                                                                        </SelectItem>
                                                                        <SelectItem value="Others">
                                                                            Otros
                                                                        </SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`rodentAreas.${index}.rodentMaterials`}
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
                                                                        <SelectItem value="Fungicide">
                                                                            Fungicida
                                                                        </SelectItem>
                                                                        <SelectItem value="RodenticideOrBait">
                                                                            Cebo Raticida
                                                                        </SelectItem>
                                                                        <SelectItem value="StickyTrap">
                                                                            Trampa Pegante
                                                                        </SelectItem>
                                                                        <SelectItem value="Tomahawk">
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
                                                        name={`rodentAreas.${index}.productName`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-sm font-medium">
                                                                    Principio Activo
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="Ingresar Principio Activo" {...field} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`rodentAreas.${index}.productDose`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-sm font-medium">
                                                                    Dosis Utilizada
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="Ingresar Dosis Utilizada" {...field} />
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

                            <div className="mt-4 flex flex-col gap-4">
                                <FormField
                                    control={form.control}
                                    name={"incidents"}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium">
                                                Incidencias Encontradas
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    placeholder="Describa las incidencias encontradas ..."
                                                    className="min-h-[60px] resize-y"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="correctiveMeasures"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-medium">
                                                Medidas Correctivas
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    placeholder="Describa las medidas correctivas aplicadas o recomendadas..."
                                                    className="min-h-[100px] resize-y"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </form>
                    </Form>

                    <div className="flex gap-2 mt-5 justify-end">
                        <Button
                            type="button"
                            className="bg-blue-700 hover:bg-blue-800 flex items-center gap-2 px-6 py-2"
                            onClick={async() =>
                            {
                                await form.handleSubmit(handleSubmit)();
                            }}
                        >
                            <Save className="h-4 w-4" />
                            Guardar
                        </Button>
                        <div>
                            <Button
                                variant="outline"
                                size="icon"
                                className="sm:hidden"
                                onClick={() => setSendOpen(true)}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="hidden sm:flex items-center gap-2"
                                onClick={() => setSendOpen(true)}
                            >
                                <Send className="h-4 w-4" />
                                Enviar
                            </Button>
                            <DocumentSenderDialog
                                open={sendOpen}
                                setOpen={setSendOpen}
                                documentName="Registro de Roedores"
                                startingEmail={project.client?.email ?? ""}
                                startingNumber={project.client?.phoneNumber ?? ""}
                                pdfLoadAction={async() => GenerateRodentsPDF(appointment.id!)}
                                emailSendAction={async(email: string) => SendRodentPDFViaEmail(appointment.id!, email)}
                                whatsappSendAction={async(number: string) => SendRodentPDFViaWhatsapp(appointment.id!, number)}
                            />
                        </div>
                        <Button
                            type="button"
                            className="bg-red-700 hover:bg-red-800 flex items-center gap-2 px-6 py-2"
                            onClick={async() =>
                            {
                                await form.handleSubmit(handleSubmit)();
                                downloadPDF();
                            }}
                            form="projectForm"
                        >
                            <Save className="h-4 w-4" />
                            Descargar PDF
                        </Button>
                        <Button
                            type="button"
                            className="bg-green-700 hover:bg-green-800 flex items-center gap-2 px-6 py-2"
                            onClick={async() =>
                            {
                                await form.handleSubmit(handleSubmit)();
                                downloadExcel();
                            }}
                        >
                            <Save className="h-4 w-4" />
                            Descargar Excel
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

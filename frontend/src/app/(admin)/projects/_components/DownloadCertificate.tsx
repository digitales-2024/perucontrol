"use client";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Bug,
    Building2,
    CalendarIcon,
    Download,
    FileDigit,
    MapPin,
    Save,
    X,
} from "lucide-react";
import { parseISO } from "date-fns";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import DatePicker from "@/components/ui/date-time-picker";
import { useRouter } from "next/navigation";
import { components } from "@/types/api";

// Definir el esquema para el certificado
const certificateSchema = z.object({
    certificateNumber: z.string().min(1, "El número de certificado es requerido"),
    clientName: z.string().min(1, "El nombre del cliente es requerido"),
    location: z.string().min(1, "La ubicación es requerida"),
    businessType: z.string().min(1, "El giro del negocio es requerido"),
    treatedArea: z.string().min(1, "El área tratada es requerida"),
    serviceDate: z.string().min(1, "La fecha de servicio es requerida"),
    expirationDate: z.string().min(1, "La fecha de vencimiento es requerida"),
    technicalDirector: z.string().min(1, "El director técnico es requerido"),
    responsible: z.string().min(1, "El responsable es requerido"),
    services: z.object({
        fumigation: z.boolean().default(false),
        disinsection: z.boolean().default(false),
        deratization: z.boolean().default(false),
        disinfection: z.boolean().default(false),
        tankCleaning: z.boolean().default(false),
        drinkingWaterTankCleaning: z.boolean().default(false),
    }),
});

type CertificateSchema = z.infer<typeof certificateSchema>

export function DownloadCertificateForm({
    onOpenChange,
    project,
    appointment,
}: {
  onOpenChange: (v: boolean) => void
  project: components["schemas"]["ProjectSummarySingle"];
  appointment: components["schemas"]["ProjectAppointment"];
})
{
    const router = useRouter();

    const serviceNames = project.services.map((service) => service.name);

    const form = useForm<CertificateSchema>({
        resolver: zodResolver(certificateSchema),
        defaultValues: {
            certificateNumber: "",
            clientName: project.client?.name ?? project.client?.razonSocial ?? "",
            location: project?.address ?? "",
            businessType: project.client?.businessType ?? "",
            treatedArea: project.quotation?.treatedAreas ?? "",
            serviceDate: appointment.actualDate ?? new Date().toISOString(),
            expirationDate: "",
            technicalDirector: "",
            responsible: "",
            services: {
                fumigation: serviceNames.includes("Fumigación"),
                disinsection: serviceNames.includes("Desinsectación"),
                deratization: serviceNames.includes("Desratización"),
                disinfection: serviceNames.includes("Desinfección"),
                tankCleaning: serviceNames.includes("Limpieza de tanque"),
                drinkingWaterTankCleaning: serviceNames.includes("Limpieza de tanque"),
            },
        },
    });

    const onSubmit = async(data: CertificateSchema) =>
    {
        console.log("Datos del certificado:", data);
    // Aquí iría la lógica para guardar los datos del certificado
    // Similar a saveData en el componente de referencia
    };

    const downloadPDF = async() =>
    {
    // Aquí iría la lógica para generar el PDF del certificado
    // Similar a downloadPDF en el componente de referencia
        console.log("Generando PDF del certificado...");
    };

    const handleCancel = async() =>
    {
        onOpenChange(false);
        router.back();
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto p-6">
                <Form {...form}>
                    <form id="certificateForm" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Card className="border border-blue-100 dark:border-blue-900 shadow-sm hover:shadow-md transition-shadow duration-200">
                            <CardHeader className="py-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
                                <CardTitle className="text-md font-medium flex items-center">
                                    <FileDigit className="h-4 w-4 text-blue-500 mr-2" />
                    Información del Certificado
                                </CardTitle>
                            </CardHeader>
                            <Separator />
                            <CardContent className="pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="certificateNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2 font-medium">
                                                    <FileDigit className="h-4 w-4 text-blue-500" />
                            Número de Certificado
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ej: 001641" {...field} className="border-gray-300" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="serviceDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2 font-medium">
                                                        <CalendarIcon className="h-4 w-4 text-blue-500" />
                                                        Fecha del Servicio
                                                    </FormLabel>
                                                    <FormControl>
                                                        <DatePicker
                                                            value={field.value ? parseISO(field.value) : undefined}
                                                            onChange={(date) =>
                                                            {
                                                                if (date)
                                                                {
                                                                    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
                                                                    field.onChange(utcDate.toISOString());
                                                                }
                                                                else
                                                                {
                                                                    field.onChange("");
                                                                }
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="expirationDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2 font-medium">
                                                        <CalendarIcon className="h-4 w-4 text-blue-500" />
                              Fecha de Vencimiento
                                                    </FormLabel>
                                                    <FormControl>
                                                        <DatePicker
                                                            value={field.value ? parseISO(field.value) : undefined}
                                                            onChange={(date) =>
                                                            {
                                                                if (date)
                                                                {
                                                                    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
                                                                    field.onChange(utcDate.toISOString());
                                                                }
                                                                else
                                                                {
                                                                    field.onChange("");
                                                                }
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-blue-100 dark:border-blue-900 shadow-sm hover:shadow-md transition-shadow duration-200">
                            <CardHeader className="py-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
                                <CardTitle className="text-md font-medium flex items-center">
                                    <Building2 className="h-4 w-4 text-blue-500 mr-2" />
                    Información del Cliente
                                </CardTitle>
                            </CardHeader>
                            <Separator />
                            <CardContent className="pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="clientName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2 font-medium">
                                                    <Building2 className="h-4 w-4 text-blue-500" />
                            Razón Social/Nombre
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Nombre del cliente" {...field} className="border-gray-300" />
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
                                                <FormLabel className="flex items-center gap-2 font-medium">
                                                    <Building2 className="h-4 w-4 text-blue-500" />
                            Giro del Negocio
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Giro del negocio" {...field} className="border-gray-300" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="location"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel className="flex items-center gap-2 font-medium">
                                                    <MapPin className="h-4 w-4 text-blue-500" />
                            Ubicación
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Dirección completa" {...field} className="border-gray-300" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="treatedArea"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel className="flex items-center gap-2 font-medium">
                                                    <MapPin className="h-4 w-4 text-blue-500" />
                            Área Tratada
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Descripción del área tratada" {...field} className="border-gray-300" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-blue-100 dark:border-blue-900 shadow-sm hover:shadow-md transition-shadow duration-200">
                            <CardHeader className="py-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
                                <CardTitle className="text-md font-medium flex items-center">
                                    <Bug className="h-4 w-4 text-blue-500 mr-2" />
                    Servicios Realizados
                                </CardTitle>
                            </CardHeader>
                            <Separator />
                            <CardContent className="pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="services.fumigation"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                            className="data-[state=checked]:bg-blue-500"
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                            Fumigación
                                                    </FormLabel>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="services.disinsection"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                            className="data-[state=checked]:bg-blue-500"
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                            Desinsectación
                                                    </FormLabel>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="services.deratization"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                            className="data-[state=checked]:bg-blue-500"
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                            Desratización
                                                    </FormLabel>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="services.disinfection"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                            className="data-[state=checked]:bg-blue-500"
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                            Desinfección
                                                    </FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="services.tankCleaning"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                            className="data-[state=checked]:bg-blue-500"
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal text-sm">
                                                            Limpieza y desinfección de tanques elevados y cisternas de agua
                                                    </FormLabel>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="services.drinkingWaterTankCleaning"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                            className="data-[state=checked]:bg-blue-500"
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal text-sm">
                                                            Limpieza y desinfección de tanques cisternas de agua potable
                                                    </FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </Form>
            </div>

            <div className="sticky bottom-0 left-0 right-0 border-t bg-white dark:bg-background p-4 shadow-md z-10 backdrop-blur-sm">
                <div className="flex justify-end gap-3 px-6">
                    <Button type="button" onClick={handleCancel} variant="outline" className="flex items-center gap-2">
                        <X className="h-4 w-4" />
                        Cancelar
                    </Button>

                    <Button
                        type="button"
                        onClick={form.handleSubmit(onSubmit)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                        <Save className="h-4 w-4" />
                        Guardar
                    </Button>

                    <Button
                        type="button"
                        onClick={downloadPDF}
                        form="certificateForm"
                        className="bg-red-500 hover:bg-red-600 flex items-center gap-2"
                    >
                        <Download className="h-4 w-4" />
                        Generar PDF
                    </Button>
                </div>
            </div>
        </div>
    );
}

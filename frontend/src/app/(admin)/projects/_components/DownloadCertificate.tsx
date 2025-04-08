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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import DatePicker from "@/components/ui/date-time-picker";
import { useRouter } from "next/navigation";
import { components } from "@/types/api";
import { toastWrapper } from "@/types/toasts";
import { certificateSchema, CertificateSchema } from "../schemas";
import { GenerateCertificateExcel, GenerateCertificatePDF, GetCertificateOfAppointmentById, SaveCertificateData } from "../actions";
import { useEffect } from "react";

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
            expirationDate: "",
            certificateNumber: "",
            clientName: project.client?.name ?? project.client?.razonSocial ?? "",
            location: project?.address ?? "",
            businessType: project.client?.businessType ?? "",
            treatedArea: project.quotation?.treatedAreas ?? "",
            serviceDate: appointment.actualDate ?? new Date().toISOString(),
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

    useEffect(() =>
    {
        const loadCertificate = async() =>
        {
            const [data, error] = await GetCertificateOfAppointmentById(appointment.id!);

            if (error)
            {
                console.error("Error al cargar el certificado:", error);
                return;
            }

            if (data?.expirationDate)
            {
                form.setValue("expirationDate", data.expirationDate);
            }
        };

        loadCertificate();
    }, [appointment.id, form]);

    const onSubmit = async() =>
    {
        await saveData();
    };

    const saveData = async() =>
    {
        try
        {
            const expirationDate = form.getValues("expirationDate");
            if (!expirationDate)
            {
                throw new Error("La fecha de vencimiento es requerida");
            }

            const body = {
                projectAppointmentId: appointment.id!,
                expirationDate,
            };

            const [, error] = await toastWrapper(
                SaveCertificateData(project.id!, body),
                {
                    loading: "Guardando datos...",
                    success: "Datos guardados correctamente",
                    error: (e) => `Error al guardar los datos: ${e.message}`,
                },
            );

            if (error)
            {
                throw error;
            }

            return true;
        }
        catch (error)
        {
            console.error("Error al guardar los datos:", error);
            return false;
        }
    };

    const downloadPDF = async() =>
    {
        const [blob, err] = await toastWrapper(GenerateCertificatePDF(appointment.id!), {
            loading: "Generando archivo",
            success: "PDF generado",
            error: (e) => `Error al generar el PDF: ${e.message}`,
        });

        if (err)
        {
            console.error("Error al generar el PDF:", err);
            return;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `certificado_${appointment.id!.substring(0, 4)}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        onOpenChange(false);
    };

    const downloadExcel = async() =>
    {
        console.log(appointment);
        // Genera el Excel
        const [blob, err] = await toastWrapper(GenerateCertificateExcel(appointment.id!), {
            loading: "Generando archivo",
            success: "Excel generado",
            error: (e) => `Error al generar el Excel: ${e.message}`,
        });

        if (err)
        {
            console.error("Error al generar el Excel:", err);
            return;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "servicio.ods";
        a.click();
        URL.revokeObjectURL(url);
        onOpenChange(false);
    };

    const handleSubmit = async() =>
    {
        const expirationDate = form.getValues("expirationDate");

        const body =
      {
          projectAppointmentId: appointment.id!,
          expirationDate,
      };
        const [result, error] = await toastWrapper(
            // SaveCertificateData(project.id!, input), // Cambia a `true` si es una actualización
            SaveCertificateData(project.id!, body),
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
                                                                    const formattedDate = date.toISOString();
                                                                    field.onChange(formattedDate);
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
                                                                    const formattedDate = date.toISOString();
                                                                    field.onChange(formattedDate);
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
                                                    <Input placeholder="Nombre del cliente" disabled {...field} className="border-gray-300" />
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
                                                    <Input placeholder="Giro del negocio" disabled {...field} className="border-gray-300" />
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
                                                    <Input placeholder="Dirección completa" disabled {...field} className="border-gray-300" />
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
                                                    <Input placeholder="Descripción del área tratada" disabled {...field} className="border-gray-300" />
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
                                                            disabled
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
                                                            disabled
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
                                                            disabled
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
                                                            disabled
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
                                                            disabled
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
                                                            disabled
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
                        onClick={async() =>
                        {
                            await form.handleSubmit(handleSubmit)();
                        }}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                        <Save className="h-4 w-4" />
                        Guardar
                    </Button>

                    <Button type="button"
                        onClick={async() =>
                        {
                            await form.handleSubmit(handleSubmit)();
                            downloadExcel();
                        }}
                        form="projectForm"
                        className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                    >
                        <Download className="h-4 w-4" />
                        Generar Excel
                    </Button>

                    <Button
                        type="button"
                        onClick={async() =>
                        {
                            await form.handleSubmit(handleSubmit)();
                            downloadPDF();
                        }
                        }
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

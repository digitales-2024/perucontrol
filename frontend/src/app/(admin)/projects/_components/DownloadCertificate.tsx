"use client";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Bug,
    Building2,
    CalendarIcon,
    Download,
    FileDigit,
    FileText,
    MapPin,
    Save,
    Send,
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
import { DocumentSenderDialog } from "@/components/DocumentSenderDialog";
import { useState } from "react";
import { GenerateCertificatePDF, GenerateCertificateWord, SaveCertificateData, SendCertificatePDFViaEmail, SendCertificatePDFViaWhatsapp } from "../[id]/evento/[app_id]/certificado/actions";

export function DownloadCertificateForm({
    onOpenChange,
    project,
    appointment,
    certificate,
}: {
    onOpenChange: (v: boolean) => void
    project: components["schemas"]["ProjectSummarySingle"];
    appointment: components["schemas"]["ProjectAppointmentDTO"];
    certificate: components["schemas"]["Certificate"]
})
{
    const router = useRouter();
    const [sendOpen, setSendOpen] = useState(false);

    const serviceNames = project.services.map((service) => service.name);
    const certificateNumber = appointment.certificateNumber?.toString(10).padStart(3, "0") ?? "";

    const form = useForm<CertificateSchema>({
        resolver: zodResolver(certificateSchema),
        defaultValues: {
            expirationDate: certificate.expirationDate ?? "",
            certificateNumber,
            clientName: project.client?.name ?? project.client?.razonSocial ?? "",
            location: project?.address ?? "",
            businessType: project.client?.businessType ?? "",
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
                SaveCertificateData(certificate.id!, body),
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
        const [blob, err] = await toastWrapper(GenerateCertificatePDF(certificate.id!), {
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

    const downloadWord = async() =>
    {
        // Genera el Word
        const [blob, err] = await toastWrapper(GenerateCertificateWord(certificate.id!), {
            loading: "Generando archivo",
            success: "Word generado",
            error: (e) => `Error al generar el Word: ${e.message}`,
        });

        if (err)
        {
            console.error("Error al generar el Word:", err);
            return;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `certificado_${appointment.id!.substring(0, 4)}.docx`;
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
            SaveCertificateData(certificate.id!, body),
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
                                    <div>
                                        <div className="flex items-center gap-2 font-medium mb-2">
                                            <FileDigit className="h-4 w-4 text-blue-500" />
                                            Número de Certificado
                                        </div>
                                        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm">
                                            {certificateNumber || "No asignado"}
                                        </div>
                                    </div>

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
                                    <div>
                                        <div className="flex items-center gap-2 font-medium mb-2">
                                            <Building2 className="h-4 w-4 text-blue-500" />
                                            Razón Social/Nombre
                                        </div>
                                        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm">
                                            {project.client?.name ?? project.client?.razonSocial ?? "No especificado"}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 font-medium mb-2">
                                            <Building2 className="h-4 w-4 text-blue-500" />
                                            Giro del Negocio
                                        </div>
                                        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm">
                                            {project.client?.businessType ?? "No especificado"}
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <div className="flex items-center gap-2 font-medium mb-2">
                                            <MapPin className="h-4 w-4 text-blue-500" />
                                            Ubicación
                                        </div>
                                        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm">
                                            {project?.address ?? "No especificada"}
                                        </div>
                                    </div>

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
                                        <div className="flex flex-row items-start space-x-3 space-y-0">
                                            <Checkbox
                                                checked={serviceNames.includes("Fumigación")}
                                                disabled
                                                className="data-[state=checked]:bg-blue-500"
                                            />
                                            <span className="font-normal text-sm">
                                                Fumigación
                                            </span>
                                        </div>

                                        <div className="flex flex-row items-start space-x-3 space-y-0">
                                            <Checkbox
                                                checked={serviceNames.includes("Desinsectación")}
                                                disabled
                                                className="data-[state=checked]:bg-blue-500"
                                            />
                                            <span className="font-normal text-sm">
                                                Desinsectación
                                            </span>
                                        </div>

                                        <div className="flex flex-row items-start space-x-3 space-y-0">
                                            <Checkbox
                                                checked={serviceNames.includes("Desratización")}
                                                disabled
                                                className="data-[state=checked]:bg-blue-500"
                                            />
                                            <span className="font-normal text-sm">
                                                Desratización
                                            </span>
                                        </div>

                                        <div className="flex flex-row items-start space-x-3 space-y-0">
                                            <Checkbox
                                                checked={serviceNames.includes("Desinfección")}
                                                disabled
                                                className="data-[state=checked]:bg-blue-500"
                                            />
                                            <span className="font-normal text-sm">
                                                Desinfección
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex flex-row items-start space-x-3 space-y-0">
                                            <Checkbox
                                                checked={serviceNames.includes("Limpieza de tanque")}
                                                disabled
                                                className="data-[state=checked]:bg-blue-500"
                                            />
                                            <span className="font-normal text-sm">
                                                Limpieza y desinfección de tanques elevados y cisternas de agua
                                            </span>
                                        </div>

                                        <div className="flex flex-row items-start space-x-3 space-y-0">
                                            <Checkbox
                                                checked={serviceNames.includes("Limpieza de tanque")}
                                                disabled
                                                className="data-[state=checked]:bg-blue-500"
                                            />
                                            <span className="font-normal text-sm">
                                                Limpieza y desinfección de tanques cisternas de agua potable
                                            </span>
                                        </div>
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
                            documentName="Certificado"
                            startingEmail={project.client?.email?.value ?? ""}
                            startingNumber={project.client?.phoneNumber?.value ?? ""}
                            pdfLoadAction={async() => GenerateCertificatePDF(certificate.id!)}
                            emailSendAction={async(d) => SendCertificatePDFViaEmail(certificate.id!, d)}
                            whatsappSendAction={async(d) => SendCertificatePDFViaWhatsapp(certificate.id!, d)}
                        />
                    </div>

                    <Button
                        type="button"
                        onClick={async() =>
                        {
                            await form.handleSubmit(handleSubmit)();
                            downloadWord();
                        }}
                        form="projectForm"
                        className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                    >
                        <FileText className="h-4 w-4" />
                        Generar Word
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

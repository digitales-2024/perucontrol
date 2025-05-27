"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import DatePicker from "@/components/ui/date-time-picker";
import ReportBuilder from "@/components/common/ReportBuilder";
import { toastWrapper } from "@/types/toasts";
import { useRouter } from "next/navigation";
import { components } from "@/types/api";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reportFormSchema, type ReportFormData, type TextBlock, type TextArea } from "../schemas";
import { GenerateDesratizacionWord, UpdateDesratizacion } from "../actions";

interface DesratizacionFormProps {
    projectId: string;
    appointmentId: string;
    reportTitle: string;
    report: components["schemas"]["Report2DTO"];
}

export function DesratizacionForm({
    projectId,
    appointmentId,
    reportTitle,
    report,
}: DesratizacionFormProps)
{
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const defaultContent: Array<TextBlock | TextArea> = [
        {
            $type: "textBlock" as const,
            title: "",
            numbering: "1",
            level: 0,
            sections: [] as Array<TextBlock | TextArea>,
        },
    ];

    const formMethods = useForm<ReportFormData>({
        resolver: zodResolver(reportFormSchema),
        defaultValues: {
            id: report.id,
            signingDate: report.signingDate ?? null,
            content: (report.content?.length ?? 0) > 0 ? (report.content as Array<TextBlock | TextArea>) : defaultContent,
        },
    });

    const { handleSubmit, watch, setValue } = formMethods;
    const signingDate = watch("signingDate");

    // Efecto para mantener sincronizada la fecha de firma
    useEffect(() =>
    {
        if (report.signingDate)
        {
            setValue("signingDate", report.signingDate);
        }
    }, [report.signingDate, setValue]);

    const handleUpdateReport = async(data: ReportFormData) =>
    {
        if (!data.signingDate)
        {
            toastWrapper(
                Promise.reject(new Error("Por favor seleccione una fecha de emisión")),
                {
                    loading: "Guardando datos...",
                    success: "Datos guardados correctamente",
                    error: () => "Debe seleccionar una fecha de emisión",
                },
            );
            return;
        }

        // UpdateDesratizacion
        const [, error] = await toastWrapper(
            UpdateDesratizacion(appointmentId, {
                ...data,
                id: report.id,
            }),
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
    };

    const onSubmit = async(data: ReportFormData) =>
    {
        setIsSubmitting(true);

        if (!data.signingDate)
        {
            toastWrapper(
                Promise.reject(new Error("Por favor seleccione una fecha de emisión")),
                {
                    loading: "Guardando datos...",
                    success: "Datos guardados correctamente",
                    error: () => "Debe seleccionar una fecha de emisión",
                },
            );
            setIsSubmitting(false);
            return;
        }

        try
        {
            // Primero guardamos los datos
            const [, updateError] = await toastWrapper(
                UpdateDesratizacion(appointmentId, {
                    ...data,
                    id: report.id,
                }),
                {
                    loading: "Guardando datos...",
                    success: "Datos guardados correctamente",
                    error: (e) => `Error al guardar los datos: ${e.message}`,
                },
            );

            if (updateError)
            {
                console.error("Error al guardar los datos:", updateError);
                setIsSubmitting(false);
                return;
            }

            // Luego generamos el informe
            console.log("Generando informe de desratización para cita:", appointmentId);

            const [blob, err] = await toastWrapper(
                GenerateDesratizacionWord(appointmentId),
                {
                    loading: "Generando documento...",
                    success: "Documento generado con éxito",
                    error: (e) => `Error al generar: ${e.message}`,
                },
            );

            if (err)
            {
                console.error("Error al generar el documento:", err);
                setIsSubmitting(false);
                return;
            }

            if (!blob)
            {
                console.error("No se recibió el documento");
                toastWrapper(
                    Promise.reject(new Error("No se pudo generar el documento")),
                    {
                        loading: "Generando documento...",
                        success: "Documento generado con éxito",
                        error: () => "No se pudo generar el documento",
                    },
                );
                setIsSubmitting(false);
                return;
            }

            // Crear y descargar el archivo
            const url = URL.createObjectURL(blob as Blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "Informe_Desratización.docx";
            a.click();
            URL.revokeObjectURL(url);

            // Redirigir de vuelta a la página de la cita
            router.push(`/projects/${projectId}/${appointmentId}`);
        }
        catch (error)
        {
            console.error("Error en la generación del informe:", error);
            toastWrapper(
                Promise.reject(error),
                {
                    loading: "Generando informe...",
                    success: "Informe generado correctamente",
                    error: (e) => `Error al generar el informe: ${e.message}`,
                },
            );
        }
        finally
        {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="mt-6">
            <CardHeader className="pb-3 border-b">
                <CardTitle className="text-lg font-semibold">
                    {reportTitle}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <FormProvider {...formMethods}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Fecha de emisión */}
                        <div className="space-y-2">
                            <Label htmlFor="emission-date">
                                Fecha de emisión
                            </Label>
                            <DatePicker
                                value={signingDate ? new Date(signingDate) : undefined}
                                onChange={(date) => setValue("signingDate", date?.toISOString() ?? null)}
                                placeholder="Seleccione una fecha de emisión"
                                className="w-full"
                            />
                            <p className="text-sm text-muted-foreground">
                                Seleccione la fecha que aparecerá en el documento generado
                            </p>
                        </div>

                        {/* Constructor de informe */}
                        <div className="space-y-2">
                            <Label>
                                Contenido del Informe
                            </Label>
                            <ReportBuilder startNumbering="1" />
                        </div>

                        {/* Botón de guardar */}
                        <div className="flex flex-wrap gap-2 justify-end">
                            <Button
                                type="button"
                                onClick={async() =>
                                {
                                    await formMethods.handleSubmit(handleUpdateReport)();
                                }}
                                className="flex items-center gap-2"
                            >
                                <Save className="h-4 w-4" />
                                Guardar
                            </Button>
                            <Button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700"
                                disabled={isSubmitting}
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {isSubmitting ? "Generando..." : "Generar Informe"}
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </CardContent>
        </Card>
    );
} 
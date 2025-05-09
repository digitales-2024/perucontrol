"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import DatePicker from "@/components/ui/date-time-picker";
import ReportBuilder from "@/components/common/ReportBuilder";
import { toastWrapper } from "@/types/toasts";
import { Generate } from "@/app/(admin)/projects/actions";
import { useRouter } from "next/navigation";

interface ReportFormProps {
    projectId: string;
    appointmentId: string;
    reportId: string;
    reportTitle: string;
}

const reportEndpoints: Record<string, string> = {
    "desinsectacion-desratizacion-desinfeccion": "disinfection/report/word",
    "desinfeccion-desinsectacion": "disinsection/report/word",
    "desratizacion": "ratextermination/report/word",
    "sostenimiento-desratizacion": "sustainability/desratization/report/word",
    "sostenimiento-desinsectacion-desratizacion": "desinsecticides/desratization/sustainment/report/word",
};

const reportFilenames: Record<string, string> = {
    "desinsectacion-desratizacion-desinfeccion": "Informe_Desinfección_Desratización_Desinsectación.docx",
    "desinfeccion-desinsectacion": "Informe_Desinfección_Desinsectación.docx",
    "desratizacion": "Informe_Desratización.docx",
    "sostenimiento-desratizacion": "Informe_Sostenimiento_Desratización.docx",
    "sostenimiento-desinsectacion-desratizacion": "Informe_Sostenimiento_Desinsectación_Desratización.docx",
};

export function ReportForm({
    projectId,
    appointmentId,
    reportId,
    reportTitle,
}: ReportFormProps)
{
    const router = useRouter();
    const [emissionDate, setEmissionDate] = useState<Date | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) =>
    {
        e.preventDefault();
        setIsSubmitting(true);

        if (!emissionDate)
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
            // Formatear la fecha para el servidor
            const dateObj = new Date(emissionDate);
            const day = dateObj.getDate().toString()
                .padStart(2, "0");
            const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
            const year = dateObj.getFullYear().toString();

            const endpoint = reportEndpoints[reportId];
            const filename = reportFilenames[reportId];

            const [blob, err] = await toastWrapper(
                Generate(projectId, endpoint, day, month, year),
                {
                    loading: "Generando documento...",
                    success: "Documento generado con éxito",
                    error: (e) => `Error al generar: ${e.message}`,
                },
            );

            if (err)
            {
                setIsSubmitting(false);
                return;
            }

            // Crear y descargar el archivo
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);

            // Redirigir de vuelta a la página de la cita
            router.push(`/projects/${projectId}/evento/${appointmentId}`);
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
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Fecha de emisión */}
                    <div className="space-y-2">
                        <Label htmlFor="emission-date">
                            Fecha de emisión
                        </Label>
                        <DatePicker
                            value={emissionDate}
                            onChange={setEmissionDate}
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
                        <ReportBuilder />
                    </div>

                    {/* Botón de guardar */}
                    <div className="flex justify-end">
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
            </CardContent>
        </Card>
    );
}

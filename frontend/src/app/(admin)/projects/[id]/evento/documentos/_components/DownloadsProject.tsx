"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle, CardContent, Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toastWrapper } from "@/types/toasts";
import { Generate } from "@/app/(admin)/projects/actions";
import { useState } from "react";
import DatePicker from "@/components/ui/date-time-picker";

const reports = [
    {
        label: "Informe de Desinfección",
        endpoint: "disinfection/report/word",
        filename: "Informe_Desinfección.docx",
        icon: "🧼",
    },
    {
        label: "Informe de Desinsectación",
        endpoint: "disinsection/report/word",
        filename: "Informe_Desinsectación.docx",
        icon: "🦟",
    },
    {
        label: "Informe de Desratización",
        endpoint: "ratextermination/report/word",
        filename: "Informe_Desratización.docx",
        icon: "🐀",
    },
    {
        label: "Sostenimiento - Desinsectación",
        endpoint: "disinfestation/sustainment/report/word",
        filename: "Informe_Sostenimiento_Desinsectación.docx",
        icon: "🔄",
    },
    {
        label: "Sostenimiento - Desinsectación y Desratización",
        endpoint: "desinsecticides/desratization/sustainment/report/word",
        filename: "Informe_Sostenimiento_Desinsectación_Desratización.docx",
        icon: "🔄",
    },
    {
        label: "Sostenimiento - Desratización",
        endpoint: "sustainability/desratization/report/word",
        filename: "Informe_Sostenimiento_Desratización.docx",
        icon: "🔄",
    },
];

export function DocumentDownloader({ projectId }: { projectId: string })
{
    const [emissionDate, setEmissionDate] = useState<Date | undefined>(undefined);

    const handleDownload = async(endpoint: string, filename: string) =>
    {
        if (!emissionDate)
        {
            toastWrapper(
                Promise.reject(new Error("Por favor seleccione una fecha de emisión")),
                {
                    loading: "Guardando datos...",
                    success: "Datos guardados correctamente",
                    error: () => "Debe seleccionar una fecha de emisión: ",
                },
            );
            return;
        }

        try
        {
            // Formatear la fecha para el servidor si es necesario
            const dateObj = new Date(emissionDate);
            const day = dateObj.getDate().toString()
                .padStart(2, "0");
            const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
            const year = dateObj.getFullYear().toString();

            const [blob, err] = await toastWrapper(
                Generate(projectId, endpoint, day, month, year),
                {
                    loading: "Generando documento...",
                    success: "Documento generado con éxito",
                    error: (e) => `Error al generar: ${e.message}`,
                },
            );

            if (err) return;

            // Crear y descargar el archivo
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        }
        catch (error)
        {
            console.error("Error en la descarga:", error);
        }
    };

    return (
        <Card className="w-full max-w-2xl mt-5">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-blue-600" />
                    Generador de Documentos
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="emission-date">
                        Fecha de emisión
                    </Label>
                    <DatePicker
                        value={emissionDate}
                        onChange={setEmissionDate}
                        placeholder="Seleccione una nueva fecha"
                        className="w-full"
                    />
                    <p className="text-sm text-muted-foreground">
                        Seleccione la fecha que aparecerá en los documentos generados
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    {reports.map((report) => (
                        <Button
                            key={report.endpoint}
                            variant="outline"
                            className="w-full sm:w-[calc(100%-0.375rem)] lg:w-[calc(100%-0.3rem)] h-auto py-3 px-4 flex items-start gap-3 text-left"
                            onClick={() => handleDownload(report.endpoint, report.filename)}
                        >
                            <span className="text-xl hidden sm:inline">
                                {report.icon}
                            </span>
                            <div className="flex-1 max-w-full">
                                <div className="font-medium truncate whitespace-nowrap">
                                    {report.label}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1 truncate whitespace-nowrap">
                                    {report.filename}
                                </div>
                            </div>
                            <Download className="h-4 w-4 ml-2 hidden sm:inline" />
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}


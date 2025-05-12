"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface ReportsListProps {
    appointmentId: string;
    projectId: string;
}

const reports = [

    {
        id: "desinsectacion-desratizacion-desinfeccion",
        title: "Informe de Desinfección, Desratización y Desinsectación",
        description: "Informe detallado del servicio de desinsectación",
        icon: "🧼🦟🐀",
    },
    {
        id: "desinfeccion-desinsectacion",
        title: "Informe de Desinfección y Desinsectación",
        description: "Informe combinado de desinfección y desinsectación",
        icon: "🧼🦟",
    },
    {
        id: "desratizacion",
        title: "Informe de Desratización",
        description: "Informe detallado del servicio de desratización",
        icon: "🐀",
    },
    {
        id: "sostenimiento-desratizacion",
        title: "Informe de Sostenimiento de Desratización",
        description: "Informe de mantenimiento del servicio de desratización",
        icon: "📋🐀",
    },
    {
        id: "sostenimiento-desinsectacion-desratizacion",
        title: "Informe de Sostenimiento de Desinsectación y Desratización",
        description: "Informe de mantenimiento combinado de desinsectación y desratización",
        icon: "📋🦟🐀",
    },
];

export function ReportsList({ appointmentId, projectId }: ReportsListProps)
{
    const router = useRouter();

    return (
        <Card className="mt-6">
            <CardHeader className="pb-3 border-b">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    Informes Disponibles
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reports.map((report) => (
                        <Card key={report.id} className="hover:shadow-md transition-shadow h-full flex flex-col">
                            <CardContent className="p-4 flex flex-col flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="text-base">
                                        {report.icon}
                                    </div>
                                    <h3 className="font-medium text-sm">
                                        {report.title}
                                    </h3>
                                </div>
                                <p className="text-xs text-muted-foreground mb-4">
                                    {report.description}
                                </p>

                                <div className="mt-auto">
                                    <Button
                                        variant="outline"
                                        className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                        onClick={() => router.push(`/projects/${projectId}/evento/${appointmentId}/informes/${report.id}`)
                                        }
                                    >
                                        <span className="flex items-center gap-2">
                                            Ver informe
                                            <ArrowRight className="h-4 w-4" />
                                        </span>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

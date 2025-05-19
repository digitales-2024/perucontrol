import { HeaderPage } from "@/components/common/HeaderPage";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb";
import { ReportForm } from "../_components/ReportForm";
import { backend, wrapper } from "@/types/backend";

interface Props {
    params: Promise<{
        id: string;
        app_id: string;
        report_id: string;
    }>;
}

const reportTitles: Record<string, string> = {
    "desinsectacion-desratizacion-desinfeccion": "Informe de Desinfección, Desratización y Desinsectación",
    "desinfeccion-desinsectacion": "Informe de Desinfección y Desinsectación",
    "desratizacion": "Informe de Desratización",
    "sostenimiento-desratizacion": "Informe de Sostenimiento de Desratización",
    "sostenimiento-desinsectacion-desratizacion": "Informe de Sostenimiento de Desinsectación y Desratización",
};

export default async function ReportPage({ params }: Props)
{
    const { id: projectId, app_id: appointmentId, report_id: reportId } = await params;

    const [report, error] = await wrapper((auth) => backend.GET("/api/Appointment/{appointmentid}/CompleteReport", {
        ...auth,
        params: {
            path: {
                appointmentid: appointmentId,
            },
        },
    }));

    if (error)
    {
        console.error("Error getting report:", error);
        return null;
    }

    return (
        <>
            <HeaderPage
                title={reportTitles[reportId] || "Informe"}
                breadcrumbs={(
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/projects">
                                    Proyectos
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <BreadcrumbLink href={`/projects/${projectId}`}>
                                    Proyecto
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <BreadcrumbLink href={`/projects/${projectId}/evento/${appointmentId}`}>
                                    Cita
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <BreadcrumbLink href={`/projects/${projectId}/evento/${appointmentId}/informes`}>
                                    Informes
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                )}
            />
            <div className="mt-6">
                <ReportForm
                    projectId={projectId}
                    appointmentId={appointmentId}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    reportId={reportId as unknown as any}
                    reportTitle={reportTitles[reportId] || "Informe"}
                    report={report}
                />
            </div>
        </>
    );
}

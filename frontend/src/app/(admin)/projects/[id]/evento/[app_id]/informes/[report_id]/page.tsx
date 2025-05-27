import { HeaderPage } from "@/components/common/HeaderPage";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { CompleteReportForm } from "../_components/ReportForm";
import { DisinfectionDesinsectForm } from "../_components/DisinfectionDesinsectForm";
import { RatExterminationSubstForm } from "../_components/RatExterminationSubstForm";
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

// Map report IDs to their corresponding API endpoints
const reportEndpoints: Record<string, string> = {
    "desinsectacion-desratizacion-desinfeccion": "/api/Appointment/{appointmentid}/CompleteReport",
    "desinfeccion-desinsectacion": "/api/Appointment/{appointmentid}/Disinfection-Desinsect",
    "desratizacion": "/api/Appointment/{appointmentid}/Report3",
    "sostenimiento-desratizacion": "/api/Appointment/{appointmentid}/RatExterminationSubst",
    "sostenimiento-desinsectacion-desratizacion": "/api/Appointment/{appointmentid}/Report2",
};

export default async function ReportPage({ params }: Props)
{
    const { id: projectId, app_id: appointmentId, report_id: reportId } = await params;

    // Get the appropriate endpoint for this report type
    const endpoint = reportEndpoints[reportId];
    if (!endpoint) {
        console.error("Unknown report type:", reportId);
        return <div>Tipo de informe no encontrado</div>;
    }

    // Fetch appointment data for breadcrumbs
    const [appointment, appointmentError] = await wrapper((auth) => backend.GET("/api/Appointment/{id}", {
        ...auth,
        params: {
            path: {
                id: appointmentId,
            },
        },
    }));

    if (appointmentError) {
        console.error("Error getting appointment:", appointmentError);
        return null;
    }

    const [report, error] = await wrapper((auth) => backend.GET(endpoint as any, {
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

    // Render the appropriate form component based on report_id
    const renderReportForm = () => {
        switch (reportId) {
            case "desinsectacion-desratizacion-desinfeccion":
                return (
                    <CompleteReportForm
                        projectId={projectId}
                        appointmentId={appointmentId}
                        reportId={reportId as any}
                        reportTitle={reportTitles[reportId]}
                        report={report}
                    />
                );
            case "desinfeccion-desinsectacion":
                return (
                    <DisinfectionDesinsectForm
                        projectId={projectId}
                        appointmentId={appointmentId}
                        reportTitle={reportTitles[reportId]}
                        report={report}
                    />
                );
            case "sostenimiento-desratizacion":
                return (
                    <RatExterminationSubstForm
                        projectId={projectId}
                        appointmentId={appointmentId}
                        reportTitle={reportTitles[reportId]}
                        report={report}
                    />
                );
            default:
                return <div>Tipo de informe no soportado: {reportId}</div>;
        }
    };

    return (
        <>
            <HeaderPage
                title={reportTitles[reportId] || "Informe"}
                breadcrumbs={(
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/projects">
                                    Todos los servicios
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink href={`/projects/${projectId}`}>
                                    Servicio #{appointment.project.projectNumber}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink href={`/projects/${projectId}/${appointmentId}`}>
                                    Fecha #{appointment.orderedNumber}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>
                                    {reportTitles[reportId] || "Informe"}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                )}
            />
            <div className="mt-6">
                {renderReportForm()}
            </div>
        </>
    );
}

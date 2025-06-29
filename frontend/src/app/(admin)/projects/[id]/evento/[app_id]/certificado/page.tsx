import { HeaderPage } from "@/components/common/HeaderPage";
import { backend, wrapper } from "@/types/backend";
import { CertificateForm } from "./_CertificateForm";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { GetCertificateOfAppointmentById } from "./actions";

interface Props {
    params: Promise<{
        id: string;
        app_id: string
    }>
}

export default async function ProjectsPage({ params }: Props)
{
    const { id, app_id: appId } = await params;

    const [project, projectError] = await wrapper((auth) => backend.GET("/api/Project/{id}/v2", {
        ...auth,
        params: {
            path: {
                id,
            },
        },
    }));
    if (projectError)
    {
        console.error("Error getting project:", projectError);
        return null;
    }

    const [appointmentCrumb, appointmentError] = await wrapper((auth) => backend.GET("/api/Appointment/{id}", {
        ...auth,
        params: {
            path: {
                id: appId,
            },
        },
    }));
    if (appointmentError)
    {
        console.error("Error getting appointment:", appointmentError);
        return null;
    }

    const appointment = project.appointments.find((app) => app.id === appId);
    if (appointment === undefined)
    {
        console.error("Error getting project:", projectError);
        return null;
    }

    const [data, error] = await GetCertificateOfAppointmentById(appointment.id!);

    if (error)
    {
        console.error("Error al cargar el certificado:", error);
        return;
    }

    return (
        <>
            <HeaderPage
                title="Certificado"
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
                                <BreadcrumbLink href={`/projects/${appointmentCrumb.project.id}`}>
                                    Servicio #
                                    {appointmentCrumb.project.projectNumber}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink href={`/projects/${appointmentCrumb.project.id}/${appId}`}>
                                    Fecha #
                                    {appointment.appointmentNumber}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>
                                    Certificado
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                )}
            />
            <CertificateForm project={project} appointment={appointment} certificate={data} />
        </>
    );
}

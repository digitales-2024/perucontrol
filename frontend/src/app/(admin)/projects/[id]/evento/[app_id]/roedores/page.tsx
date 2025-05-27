import { HeaderPage } from "@/components/common/HeaderPage";
import { backend, wrapper } from "@/types/backend";
import { RoedoresForm } from "./_RoedoresForm";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

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
    const [appointment, appointmentError] = await wrapper((auth) => backend.GET("/api/Appointment/{id}", {
        ...auth,
        params: {
            path: {
                id: appId,
            },
        },
    }));
    const [rodent, rodentError] = await wrapper((auth) => backend.GET("/api/Appointment/{appointmentid}/rodent", {
        ...auth,
        params: {
            path: {
                appointmentid: appointment.id!,
            },
        },
    }));

    if (projectError || appointmentError)
    {
        console.error("Error getting project:", projectError);
        return null;
    }
    const appointmentData = project.appointments.find((app) => app.id === appId);
    if (appointmentData === undefined)
    {
        console.error("Error getting project:", projectError);
        return null;
    }
    if (rodentError)
    {
        console.error("Error getting rodent:", projectError);
        return null;
    }

    return (
        <>
            <HeaderPage
                title="Registro de Roedores"
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
                                <BreadcrumbLink href={`/projects/${appointment.project.id}`}>
                                    Servicio #
                                    {appointment.project.projectNumber}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink href={`/projects/${appointment.project.id}/${appId}`}>
                                    Fecha #
                                    {appointment.appointmentNumber}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>
                                    Registro de Roedores
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                )}
            />
            <RoedoresForm project={project} appointment={appointmentData} rodent={rodent} />
        </>
    );
}

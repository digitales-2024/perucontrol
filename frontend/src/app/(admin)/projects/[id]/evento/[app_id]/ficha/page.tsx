import { HeaderPage } from "@/components/common/HeaderPage";
import { backend, wrapper } from "@/types/backend";
import { OperationsSheetForm } from "./_OperationsSheetForm";
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

    // get project by id
    const [project, projectError] = await wrapper((auth) => backend.GET("/api/Project/{id}/v2", {
        ...auth,
        params: {
            path: {
                id,
            },
        },
    }));
    const [appointmentCrumb, appointmentError] = await wrapper((auth) => backend.GET("/api/Appointment/{id}", {
        ...auth,
        params: {
            path: {
                id: appId,
            },
        },
    }));

    if (projectError || appointmentError)
    {
        console.error("Error getting project:", projectError);
        return null;
    }

    const appointment = project.appointments.find((app) => app.id === appId);
    if (appointment === undefined)
    {
        console.error("Error getting project:", projectError);
        return null;
    }

    return (
        <>
            <HeaderPage
                title="Ficha de Operaciones"
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
                                    Ficha de Operaciones
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                )}
            />
            <OperationsSheetForm project={project} client={project.client} appointment={appointment} />
        </>
    );
}

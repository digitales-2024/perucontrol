import { HeaderPage } from "@/components/common/HeaderPage";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { backend, wrapper } from "@/types/backend";
import { AppointmentDetails } from "../_components/AppointmentDetail";

export default async function AppoinmentPage({ params }: {
    params: Promise<{
        id: string;
        appointment_id: string;
    }>
})
{
    const { id, appointment_id: appointmentId } = await params;

    const [appointment, appointmentError] = await wrapper((auth) => backend.GET("/api/Appointment/{id}", {
        ...auth,
        params: {
            path: {
                id: appointmentId,
            },
        },
    }));
    if (appointmentError)
    {
        console.error("Error getting project:", appointmentError);
        return null;
    }

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

    return (
        <>
            <HeaderPage
                title="Fecha del servicio"
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
                                <BreadcrumbLink href={`/projects/${id}`}>
                                    Servicio #
                                    {project.projectNumber}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>
                                    Fecha #
                                    {appointment.appointmentNumber}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                )}
            />
            <AppointmentDetails
                project={project}
                projectId={id}
                appointment={appointment}  // Si es null, lo asignamos a false
            />
        </>
    );
}

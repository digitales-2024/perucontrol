import { HeaderPage } from "@/components/common/HeaderPage";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { backend, wrapper } from "@/types/backend";
import { UpdateClientData } from "./_components/UpdateData";

interface Props {
    params: Promise<{
        id: string;
    }>
}

export default async function ProjectsPage({ params }: Props)
{
    const { id } = await params;

    const [
        [clients, clientsError],
        [services, servicesError],
        [project, projectError],
    ] = await Promise.all([
        wrapper((auth) => backend.GET("/api/Client", { ...auth })),
        wrapper((auth) => backend.GET("/api/Service", { ...auth })),
        wrapper((auth) => backend.GET("/api/Project/{id}", {
            ...auth,
            params: {
                path: {
                    id,
                },
            },

        })),
    ]);

    if (clientsError)
    {
        console.error("Error getting all clients:", clientsError);
        return null;
    }

    if (servicesError)
    {
        console.error("Error getting all services:", servicesError);
        return null;
    }

    if (projectError)
    {
        console.error("Error getting project:", projectError);
        return null;
    }

    return (
        <>
            <HeaderPage
                title="Editar Servicio" description="Editar información general del servicio"
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
                                <BreadcrumbLink href={`/projects/${project.id}`}>
                                    Servicio #
                                    {project.projectNumber}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>
                                    Editar Servicio
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                )}
            />
            <UpdateClientData clients={clients} services={services} project={project} />
        </>
    );
}

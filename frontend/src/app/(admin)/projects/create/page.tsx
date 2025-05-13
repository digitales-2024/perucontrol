import { HeaderPage } from "@/components/common/HeaderPage";
import { backend, wrapper } from "@/types/backend";
import { ProjectForm } from "./_components/ProjectForm";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export default async function ProjectsPage()
{
    const [
        [clients, clientsError],
        [services, servicesError],
        [quotations, quotationsError],

    ] = await Promise.all([
        wrapper((auth) => backend.GET("/api/Client", { ...auth })),
        wrapper((auth) => backend.GET("/api/Service", { ...auth })),
        wrapper((auth) => backend.GET("/api/Quotation/approved/not-associated", { ...auth })),
    ]);

    if (clientsError)
    {
        console.error("Error getting all clients:", clientsError);
        return null;
    }

    if (servicesError)
    {
        console.error("Error getting all clients:", servicesError);
        return null;
    }

    if (quotationsError)
    {
        console.log("Error getting all quotations");
        return null;
    }

    return (
        <>
            <HeaderPage
                title="Nuevo Servicio"
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
                                <BreadcrumbPage>
                                    Crear Servicio
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                )}
            />
            <ProjectForm clients={clients} services={services} quotations={quotations} />
        </>
    );
}

import { HeaderPage } from "@/components/common/HeaderPage";
import { Shell } from "@/components/common/Shell";
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

    // get all clients
    const [clients, clientsError] = await wrapper((auth) => backend.GET("/api/Client", { ...auth }));
    if (clientsError)
    {
        console.error("Error getting all clients:", clientsError);
        return null;
    }

    // get all services
    const [services, servicesError] = await wrapper((auth) => backend.GET("/api/Service", { ...auth }));
    if (servicesError)
    {
        console.error("Error getting all services:", servicesError);
        return null;
    }

    // get all quotations
    const [quotations, quotationsError] = await wrapper((auth) => backend.GET("/api/Quotation", { ...auth }));
    if (quotationsError)
    {
        console.error("Error getting all quotations:", quotationsError);
        return null;
    }

    // get project by id
    const [project, projectError] = await wrapper((auth) => backend.GET("/api/Project/{id}", {
        ...auth ,
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
        <Shell>
            <HeaderPage title="Editar Servicio" description="Has los cambios que necesites en el servicio y guarda" />
            <UpdateClientData clients={clients} services={services} quotations={quotations} project={project} />
        </Shell>
    );
}

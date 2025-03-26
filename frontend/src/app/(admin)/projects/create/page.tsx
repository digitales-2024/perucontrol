import { HeaderPage } from "@/components/common/HeaderPage";
import { Shell } from "@/components/common/Shell";
import { backend, wrapper } from "@/types/backend";
import { ProjectForm } from "./_components/ProjectForm";

export default async function ProjectsPage()
{
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
        console.error("Error getting all clients:", servicesError);
        return null;
    }

    // get all quotation
    const [quotations, quotationsError] = await wrapper((auth) => backend.GET("/api/Quotation/approved/not-associated", {...auth}));

    if (quotationsError)
    {
        console.log("Error getting all quotations");
        return null;
    }

    return (
        <Shell>
            <HeaderPage title="Nuevo Servicio" description="Registra un nuevo servicio" />
            <ProjectForm clients={clients} services={services} quotations={quotations} />
        </Shell>
    );
}

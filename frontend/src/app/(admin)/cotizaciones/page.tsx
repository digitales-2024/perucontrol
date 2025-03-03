import { backend, wrapper } from "@/types/backend";
import { Shell } from "@/components/common/Shell";
import { CreateQuotation } from "./_components/CreateQuotation";
import { HeaderPage } from "@/components/common/HeaderPage";

export default async function CotizacionPage()
{
    // get all terms and conditions
    const [data, err] = await wrapper((auth) => backend.GET("/api/TermsAndConditions", auth));
    if (err)
    {
        console.error(`error ${err.message}`);
        throw err;
    }

    // get all clients
    const [clients, clientsError] = await wrapper((auth) => backend.GET("/api/Client", { ...auth }));

    if (clientsError)
    {
        console.error("Error getting all clients:", clientsError);
    }

    // get all services
    const [services, servicesError] = await wrapper((auth) => backend.GET("/api/Service", { ...auth }));

    if (servicesError)
    {
        console.error("Error getting all clients:", servicesError);
    }

    return (
        <Shell>
            <HeaderPage title="Cotizaciones" description="Gestiona las cotizaciones de la empresa" />
            <CreateQuotation termsAndConditions={data} clients={clients} services={services} />
        </Shell>
    );
}

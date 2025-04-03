import { HeaderPage } from "@/components/common/HeaderPage";
import { Shell } from "@/components/common/Shell";
import { backend, wrapper } from "@/types/backend";
import { CreateQuotation } from "./_CreateQuotation";

export default async function CotizacionPage()
{
    // get all terms and conditions
    const [terms, termsErr] = await wrapper((auth) => backend.GET("/api/TermsAndConditions", auth));
    if (termsErr)
    {
        console.error(`error ${termsErr.message}`);
        throw termsErr;
    }

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

    const activeTerms = terms.filter((term) => term.isActive);  // Filtrando los terminoss activos

    return (
        <Shell>
            <HeaderPage title="Crear cotización" description="Crea una nueva cotización" />
            <CreateQuotation  terms={activeTerms} clients={clients} services={services} />
        </Shell>
    );
}

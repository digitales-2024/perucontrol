import { HeaderPage } from "@/components/common/HeaderPage";
import { backend, wrapper } from "@/types/backend";
import { CreateQuotation } from "./_CreateQuotation";

export default async function CotizacionPage()
{
    const [
        [terms, termsErr],
        [clients, clientsError],
        [services, servicesError],
    ] = await Promise.all([
        wrapper((auth) => backend.GET("/api/TermsAndConditions", auth)),
        wrapper((auth) => backend.GET("/api/Client", { ...auth })),
        wrapper((auth) => backend.GET("/api/Service", { ...auth })),
    ]);

    if (termsErr)
    {
        console.error(`error ${termsErr.message}`);
        throw termsErr;
    }

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

    const activeTerms = terms.filter((term) => term.isActive);  // Filtrando los terminoss activos

    return (
        <>
            <HeaderPage title="Crear cotización" description="Crea una nueva cotización" />
            <CreateQuotation terms={activeTerms} clients={clients} services={services} />
        </>
    );
}

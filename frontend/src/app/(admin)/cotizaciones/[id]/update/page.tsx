import { HeaderPage } from "@/components/common/HeaderPage";
import { backend, wrapper } from "@/types/backend";
import EditQuotation from "./_components/_EditQuotation";
export default async function EditarCotizacionPage({ params }: { params: Promise<{ id: string }> })
{
    const quotationId = (await params).id;

    if (!quotationId)
    {
        throw new Error("Quotation ID is required");
    }

    // get the quotation to edit
    const [quotation, quotationErr] = await wrapper((auth) => backend.GET("/api/Quotation/{id}", {
        ...auth,
        params: {
            path: {
                id: quotationId,
            },
        },
    }));
    if (quotationErr)
    {
        console.error(`Error fetching quotation: ${quotationErr.message}`);
        throw quotationErr;
    }

    // get all terms and conditions
    const [terms, termsErr] = await wrapper((auth) => backend.GET("/api/TermsAndConditions", auth));
    if (termsErr)
    {
        console.error(`Error fetching terms: ${termsErr.message}`);
        throw termsErr;
    }

    // get all clients
    const [clients, clientsError] = await wrapper((auth) => backend.GET("/api/Client", { ...auth }));
    if (clientsError)
    {
        console.error("Error getting all clients:", clientsError);
        throw clientsError;
    }

    // get all services
    const [services, servicesError] = await wrapper((auth) => backend.GET("/api/Service", { ...auth }));
    if (servicesError)
    {
        console.error("Error getting all services:", servicesError);
        throw servicesError;
    }

    return (
        <>
            <HeaderPage title="Editar cotización" description="Modifica los detalles de la cotización" />
            <EditQuotation quotation={quotation} termsAndConditions={terms} clients={clients} services={services} />
        </>
    );
}

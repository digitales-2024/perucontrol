import { backend, wrapper } from "@/types/backend";
import { Shell } from "@/components/common/Shell";
import { HeaderPage } from "@/components/common/HeaderPage";
import { QuotationDataTable } from "./_components/QuotationsDataTable";
import { columns } from "./_components/QuotationColumns";
import { QuotationProvider } from "./context/QuotationContext";

export default async function CotizacionPage()
{
    // get all quotations
    const [quotationsData, err] = await wrapper((auth) => backend.GET("/api/Quotation", auth));
    if (err)
    {
        console.error(`error ${err.message}`);
        throw err;
    }

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

    const activeQuotation = quotationsData.filter((quotation) => quotation.isActive);  // Filtrando las cotizaciones activas
    const activeTerms = terms.filter((term) => term.isActive);  // Filtrando las cotizaciones activas

    return (
        <QuotationProvider value={{ quotations: quotationsData, terms: activeTerms, clients, services }}>
            <Shell>
                <HeaderPage title="Cotizaciones" description="Gestiona las cotizaciones de la empresa" />
                <QuotationDataTable columns={columns} data={activeQuotation} />
            </Shell>
        </QuotationProvider>
    );
}

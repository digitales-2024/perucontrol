import { backend, wrapper } from "@/types/backend";
import { HeaderPage } from "@/components/common/HeaderPage";
import { QuotationDataTable } from "./_components/QuotationsDataTable";
import { columns } from "./_components/QuotationColumns";
import { QuotationProvider } from "./context/QuotationContext";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb";

export default async function CotizacionPage()
{
    const [
        [quotationsData, err],
        [terms, termsErr],
        [clients, clientsError],
        [services, servicesError],
    ] = await Promise.all([
        wrapper((auth) => backend.GET("/api/Quotation", auth)),
        wrapper((auth) => backend.GET("/api/TermsAndConditions", auth)),
        wrapper((auth) => backend.GET("/api/Client", { ...auth })),
        wrapper((auth) => backend.GET("/api/Service", { ...auth })),
    ]);

    if (err)
    {
        console.error(`error ${err.message}`);
        throw err;
    }

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

    const activeTerms = terms.filter((term) => term.isActive);  // Filtrando los terminos activas

    return (
        <QuotationProvider value={{ quotations: quotationsData, terms: activeTerms, clients, services }}>
            <HeaderPage
                title="Cotizaciones" description="Gestiona las cotizaciones de la empresa"
                breadcrumbs={(
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/cotizaciones">
                                    Todas las cotizaciones
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                )}
            />
            <QuotationDataTable columns={columns} data={quotationsData} />
        </QuotationProvider>
    );
}

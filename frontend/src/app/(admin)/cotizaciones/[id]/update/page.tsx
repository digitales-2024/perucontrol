import { HeaderPage } from "@/components/common/HeaderPage";
import { backend, wrapper } from "@/types/backend";
import EditQuotation from "./_components/_EditQuotation";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
export default async function EditarCotizacionPage({ params }: { params: Promise<{ id: string }> })
{
    const quotationId = (await params).id;
    if (!quotationId)
    {
        throw new Error("Quotation ID is required");
    }

    const [
        [quotation, quotationErr],
        [terms, termsErr],
        [clients, clientsError],
        [services, servicesError],
    ] = await Promise.all([
        wrapper((auth) => backend.GET("/api/Quotation/{id}", {
            ...auth,
            params: {
                path: {
                    id: quotationId,
                },
            },
        })),
        wrapper((auth) => backend.GET("/api/TermsAndConditions", auth)),
        wrapper((auth) => backend.GET("/api/Client", auth)),
        wrapper((auth) => backend.GET("/api/Service", { ...auth })),
    ]);

    if (quotationErr)
    {
        console.error(`Error fetching quotation: ${quotationErr.message}`);
        throw quotationErr;
    }

    if (termsErr)
    {
        console.error(`Error fetching terms: ${termsErr.message}`);
        throw termsErr;
    }

    if (clientsError)
    {
        console.error("Error getting all clients:", clientsError);
        throw clientsError;
    }

    if (servicesError)
    {
        console.error("Error getting all services:", servicesError);
        throw servicesError;
    }

    return (
        <>
            <HeaderPage
                title="Editar cotización"
                breadcrumbs={(
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/cotizaciones">
                                    Todas las cotizaciones
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink href={`/cotizaciones/${quotationId}`}>
                                    Cotización #
                                    {quotation.quotationNumber}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>
                                    Editar
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                )}
            />
            <EditQuotation quotation={quotation} termsAndConditions={terms} clients={clients} services={services} />
        </>
    );
}

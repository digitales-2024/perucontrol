import { HeaderPage } from "@/components/common/HeaderPage";
import { backend, wrapper } from "@/types/backend";
import { ViewQuotationDetails } from "./ViewQuotationDetails";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

interface Props {
    params: Promise<{
        id: string;
    }>
}

export default async function QuotationDetail({ params }: Props)
{
    const { id } = await params;

    // get quotation by id
    const [quotation, quotationError] = await wrapper((auth) => backend.GET("/api/Quotation/{id}", {
        ...auth,
        params: {
            path: {
                id,
            },
        },

    }));
    if (quotationError)
    {
        console.error("Error getting quotation:", quotationError);
        return null;
    }

    return (
        <>
            <HeaderPage
                title="Detalle de cotización"
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
                                <BreadcrumbPage>
                                    Cotización #
                                    {quotation.quotationNumber}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                )}
            />
            <ViewQuotationDetails quotation={quotation} />
        </>
    );
}

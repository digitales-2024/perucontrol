import { HeaderPage } from "@/components/common/HeaderPage";
import { backend, wrapper } from "@/types/backend";
import { ViewQuotationDetails } from "../_components/ViewQuotationDetails";

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
            <HeaderPage title={"Cotizacion"} description="Detalle de la cotización" />
            <ViewQuotationDetails quotation={quotation} />
        </>
    );
}

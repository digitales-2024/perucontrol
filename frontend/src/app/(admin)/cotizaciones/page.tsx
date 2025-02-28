import { backend, wrapper } from "@/types/backend";
import { Shell } from "@/components/common/Shell";
import { CreateQuotation } from "./_create";
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

    return (
        <Shell>
            <HeaderPage title="Cotizaciones" description="Gestiona las cotizaciones de la empresa" />

            <CreateQuotation termsAndConditions={data} />
        </Shell>
    );
}

import { backend, wrapper } from "@/types/backend";
import { Shell } from "@/components/common/Shell";
import { HeaderPage } from "@/components/common/HeaderPage";
import { QuotationDataTable } from "./_components/QuotationsDataTable";
import { columns } from "./_components/QuotationColumns";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Quotation } from "./types/quotation";

export default function CotizacionPage()
{
    const router = useRouter();
    const [quotations, setQuotations] = useState<Array<Quotation>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() =>
    {
        const fetchData = async() =>
        {
            try
            {
                // get all quotations
                const [quotationsData, err] = await wrapper((auth) => backend.GET("/api/Quotation", auth));
                if (err)
                {
                    console.error(`error ${err.message}`);
                    throw err;
                }
                setQuotations(quotationsData);
                setLoading(false);
            }
            catch (error)
            {
                router.push("/(admi)/cotizaciones/error");
                console.log(error);
            }
        };
        fetchData();
    }, [router]);

    if (loading)
    {
        return (
            <div>
                Cargando ....
            </div>
        );
    }

    return (
        <Shell>
            <HeaderPage title="Cotizaciones" description="Gestiona las cotizaciones de la empresa" />
            <QuotationDataTable columns={columns} data={quotations} />
        </Shell>
    );
}

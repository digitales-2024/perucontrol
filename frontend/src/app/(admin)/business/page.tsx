import { HeaderPage } from "@/components/common/HeaderPage";
import { Shell } from "@/components/common/Shell";
import { CompanyInfoForm } from "./_components/CompanyInfo";
import { backend, wrapper } from "@/types/backend";

export default async function ClientsPage()
{
    const [businessInfo, error] = await wrapper((auth) => backend.GET("/api/Business", { ...auth }));

    if (error)
    {
        console.log("Error getting business info", error);
        <Shell>
            <HeaderPage title="Información de PeruControl" description="No se pudo cargar la información." />
            <p className="text-red-500 text-sm">
                Ocurrió un error al obtener la información de la empresa.
            </p>
        </Shell>;
    }

    return (
        <Shell>
            <HeaderPage title="Información de PeruControl" />
            <CompanyInfoForm businessInfo={Array.isArray(businessInfo) ? businessInfo[0] : businessInfo} />
        </Shell>
    );
}

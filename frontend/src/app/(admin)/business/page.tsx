import { HeaderPage } from "@/components/common/HeaderPage";
import { CompanyInfoForm } from "./_components/CompanyInfo";
import { backend, wrapper } from "@/types/backend";
import { SignaturesForm } from "./_components/Signatures";

export default async function ClientsPage()
{
    const [businessInfo, error] = await wrapper((auth) => backend.GET("/api/Business", { ...auth }));

    if (error)
    {
        console.log("Error getting business info", error);
        return (
            <>
                <HeaderPage title="Información de PeruControl" description="No se pudo cargar la información." />
                <p className="text-red-500 text-sm">
                    Ocurrió un error al obtener la información de la empresa.
                </p>
            </>
        );
    }

    return (
        <>
            <HeaderPage title="Información de PeruControl" />
            <CompanyInfoForm businessInfo={Array.isArray(businessInfo) ? businessInfo[0] : businessInfo} />
            <SignaturesForm />
        </>
    );
}

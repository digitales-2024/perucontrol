import { HeaderPage } from "@/components/common/HeaderPage";
import { CompanyInfoForm } from "./_components/CompanyInfo";
import { backend, wrapper } from "@/types/backend";
import { SignaturesForm } from "./_components/Signatures";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_KEY } from "@/variables";

async function fetchImageBase64(name: string): Promise<string|undefined>
{
    const c = await cookies();
    const jwt = c.get(ACCESS_TOKEN_KEY);

    const res = await fetch(`${process.env.INTERNAL_BACKEND_URL}/api/Business/image/${name}`, {
        headers: {
            Authorization: `Bearer ${jwt?.value}`,
        },
    });

    if (res.status === 404) return undefined;
    if (!res.ok) throw new Error("Failed to fetch image");
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    // Adjust mime type as needed
    return `data:image/png;base64,${base64}`;
}

export default async function ClientsPage()
{

    const [
        img1,
        img2,
        [businessInfo, error],
    ] = await Promise.all([
        fetchImageBase64("signature1"),
        fetchImageBase64("signature2"),
        wrapper((auth) => backend.GET("/api/Business", { ...auth })),
    ]);

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

    const thechnicalDirector = {
        name: businessInfo[0].thechnicalDirectorName,
        position: businessInfo[0].thechnicalDirectorPosition,
        cip: businessInfo[0].thechnicalDirectorCIP,
    };

    const responsible = {
        name: businessInfo[0].responsibleName,
        position: businessInfo[0].responsiblePosition,
        cip: businessInfo[0].responsibleCIP,
    };

    return (
        <>
            <HeaderPage title="Información de PeruControl" />
            <CompanyInfoForm businessInfo={Array.isArray(businessInfo) ? businessInfo[0] : businessInfo} />
            <SignaturesForm initialImages={[img1,img2]} thechnicalDirector={thechnicalDirector} responsible={responsible} />
        </>
    );
}

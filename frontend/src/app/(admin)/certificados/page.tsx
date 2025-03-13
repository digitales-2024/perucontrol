import { HeaderPage } from "@/components/common/HeaderPage";
import { Shell } from "@/components/common/Shell";
import { CertificateCreate } from "./_components/CertificateCreate";
import { backend, wrapper } from "@/types/backend";

export default async function CertificatePage()
{
    const [projects, projectsErr] = await wrapper((auth) => backend.GET("/api/Project", auth));
    if (projectsErr !== null)
    {
        console.error(projectsErr);
        throw projectsErr;
    }

    return (
        <Shell>
            <HeaderPage title="Crear certificado" description="Crea un nuevo certificado" />
            <CertificateCreate projects={projects} />
        </Shell>
    );
}

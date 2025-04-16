import { HeaderPage } from "@/components/common/HeaderPage";
import { backend, wrapper } from "@/types/backend";
import { RoedoresForm } from "./_RoedoresForm";

interface Props {
    params: Promise<{
        id: string;
    }>
}

export default async function ProjectsPage({ params }: Props)
{
    const { id } = await params;

    const [project, projectError] = await wrapper((auth) => backend.GET("/{id}/v2", {
        ...auth,
        params: {
            path: {
                id,
            },
        },
    }));

    if (projectError)
    {
        console.error("Error getting project:", projectError);
        return null;
    }

    return (
        <>
            <HeaderPage title="Certificado" description="Llenar, guardar y generar el certificado." />
            <RoedoresForm project={project} />
        </>
    );
}

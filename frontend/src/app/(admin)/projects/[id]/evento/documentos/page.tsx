import { HeaderPage } from "@/components/common/HeaderPage";
import { backend, wrapper } from "@/types/backend";
import { DocumentDownloader } from "./_components/DownloadsProject";

interface Props {
    params: Promise<{
        id: string;
    }>
}

export default async function ProjectsPage({ params }: Props)
{
    const { id } = await params;

    // get project by id
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
            <HeaderPage title="Documentos" description="Llenar, guardar y generar la ficha de operaciones." />
            <DocumentDownloader projectId={project.id!} />
        </>
    );
}

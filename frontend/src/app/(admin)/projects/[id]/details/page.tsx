import { HeaderPage } from "@/components/common/HeaderPage";
import { Shell } from "@/components/common/Shell";
import { backend, wrapper } from "@/types/backend";
import { ProjectDetails } from "./_components/ProjectDetails";

interface Props {
    params: Promise<{
        id: string;
    }>
}

export default async function ProjectDetail({ params }: Props)
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
        <Shell>
            <HeaderPage title={`Servicio # ${project.projectNumber}`} />
            <ProjectDetails project={project} />
        </Shell>
    );
}

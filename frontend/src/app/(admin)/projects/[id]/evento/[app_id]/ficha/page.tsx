import { HeaderPage } from "@/components/common/HeaderPage";
import { Shell } from "@/components/common/Shell";
import { backend, wrapper } from "@/types/backend";
import { OperationsSheetForm } from "./_OperationsSheetForm";

interface Props {
    params: Promise<{
        id: string;
        app_id: string
    }>
}

export default async function ProjectsPage({ params }: Props)
{
    const { id, app_id: appId } = await params;

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

    const appointment = project.appointments.find((app) => app.id === appId);
    if (appointment === undefined)
    {
        console.error("Error getting project:", projectError);
        return null;
    }

    return (
        <Shell>
            <HeaderPage title="Ficha de Operaciones" description="Llenar, guardar y generar la ficha de operaciones." />
            <OperationsSheetForm project={project} client={project.client} appointment={appointment} />
        </Shell>
    );
}

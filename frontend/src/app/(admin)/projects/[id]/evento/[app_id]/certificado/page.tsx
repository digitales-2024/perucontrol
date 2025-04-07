import { HeaderPage } from "@/components/common/HeaderPage";
import { Shell } from "@/components/common/Shell";
import { backend, wrapper } from "@/types/backend";
import { CertificateForm } from "./_CertificateForm";

interface Props {
    params: Promise<{
        id: string;
        app_id: string
    }>
}

export default async function ProjectsPage({ params }: Props)
{
    const { id, app_id: appId } = await params;

    // get projectOperationSheet by id
    /* const [projectOperationSheet, projectOperationSheetError] = await wrapper((auth) => backend.GET("/api/ProjectOperationSheet/{id}", {
        ...auth,
        params: {
            path: {
                id,
            },
        },
    }));

    if (projectOperationSheetError)
    {
        console.error("Error getting project:", projectOperationSheetError);
        return null;
    } */

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
            <HeaderPage title="Certificado" description="Llenar, guardar y generar el certificado." />
            <CertificateForm /* projectOperationSheet={projectOperationSheet} */ project={project} appointment={appointment} />
        </Shell>
    );
}

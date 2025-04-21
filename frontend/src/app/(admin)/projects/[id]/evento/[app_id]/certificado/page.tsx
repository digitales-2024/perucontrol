import { HeaderPage } from "@/components/common/HeaderPage";
import { backend, wrapper } from "@/types/backend";
import { CertificateForm } from "./_CertificateForm";
import { GetCertificateOfAppointmentById } from "@/app/(admin)/projects/actions";

interface Props {
    params: Promise<{
        id: string;
        app_id: string
    }>
}

export default async function ProjectsPage({ params }: Props)
{
    const { id, app_id: appId } = await params;

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

    const [data, error] = await GetCertificateOfAppointmentById(appointment.id!);

    if (error)
    {
        console.error("Error al cargar el certificado:", error);
        return;
    }

    return (
        <>
            <HeaderPage title="Certificado" description="Llenar, guardar y generar el certificado." />
            <CertificateForm project={project} appointment={appointment} certificate={data} />
        </>
    );
}

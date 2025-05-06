import { HeaderPage } from "@/components/common/HeaderPage";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { backend, wrapper } from "@/types/backend";
import { AppointmentDetails } from "../_components/AppointmentDetail";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_KEY } from "@/variables";

async function fetchMurinoMapBase64(id: string): Promise<string | null>
{
    const c = await cookies();
    const jwt = c.get(ACCESS_TOKEN_KEY);

    const res = await fetch(`${process.env.INTERNAL_BACKEND_URL}/api/Appointment/${id}/murino-map`, {
        headers: {
            Authorization: `Bearer ${jwt?.value}`,
        },
    });

    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Failed to fetch murino map");

    // Obtener el Content-Type del header personalizado
    const contentType = res.headers.get("X-Content-Type");
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    // Construir Data URI con el tipo de contenido correcto
    return `data:${contentType};base64,${base64}`;
}

export default async function AppoinmentPage({ params }: {
    params: Promise<{
        id: string;
        appointment_id: string;
    }>
})
{
    const { id, appointment_id: appointmentId } = await params;

    const [appointment, appointmentError] = await wrapper((auth) => backend.GET("/api/Appointment/{id}", {
        ...auth,
        params: {
            path: {
                id: appointmentId,
            },
        },
    }));

    if (appointmentError)
    {
        console.error("Error getting project:", appointmentError);
        return null;
    }

    // obtener imagen del mapa murino
    let murinoMapBase64: string | null = null;
    try
    {
        murinoMapBase64 = await fetchMurinoMapBase64(appointmentId);
    }
    catch (e)
    {
        console.error("Error fetching murino map:", e);
    }

    return (
        <>
            <HeaderPage
                title="Fecha del servicio"
                breadcrumbs={(
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/projects">
                                    Todos los servicios
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink href={`/projects/${id}`}>
                                    Servicio #
                                    {appointment.project.projectNumber}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>
                                    Fecha #
                                    {appointment.appointmentNumber}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                )}
            />
            <AppointmentDetails
                project={appointment.project}
                projectId={id}
                appointment={appointment}  // Si es null, lo asignamos a false
                murinoMapBase64={murinoMapBase64}
            />
        </>
    );
}

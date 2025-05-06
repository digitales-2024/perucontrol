import { HeaderPage } from "@/components/common/HeaderPage";
import { backend, wrapper } from "@/types/backend";
import { ProjectDetails } from "./_components/ProjectDetails";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_KEY } from "@/variables";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

interface Props {
    params: Promise<{
        id: string;
    }>
}

// Función para obtener la imagen del mapa murino en base64
async function fetchMurinoMapBase64(id: string): Promise<string | null>
{
    const c = await cookies();
    const jwt = c.get(ACCESS_TOKEN_KEY);

    const res = await fetch(`${process.env.INTERNAL_BACKEND_URL}/api/Project/${id}/murino-map`, {
        headers: {
            Authorization: `Bearer ${jwt?.value}`,
        },
    });

    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Failed to fetch murino map");
    const buffer = await res.arrayBuffer();
    return Buffer.from(buffer).toString("base64");
}

export default async function ProjectDetail({ params }: Props)
{
    const { id } = await params;

    // get project by id
    const [project, projectError] = await wrapper((auth) => backend.GET("/api/Project/{id}/v2", {
        ...auth,
        params: {
            path: {
                id,
            },
        },
    }));

    // obtener imagen del mapa murino
    let murinoMapBase64: string | null = null;
    try
    {
        murinoMapBase64 = await fetchMurinoMapBase64(id);
    }
    catch (e)
    {
        console.error("Error fetching murino map:", e);
    }

    if (projectError)
    {
        console.error("Error getting project:", projectError);
        return null;
    }

    return (
        <>
            <HeaderPage
                title="Detalles del servicio"
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
                                <BreadcrumbPage>
                                    Servicio #
                                    {project.projectNumber}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                )}
            />
            <ProjectDetails project={project} projectId={id} murinoMapBase64={murinoMapBase64} />
        </>
    );
}

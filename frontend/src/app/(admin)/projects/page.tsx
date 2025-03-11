import { HeaderPage } from "@/components/common/HeaderPage";
import { Shell } from "@/components/common/Shell";
import { ProjectsDataTable } from "./_components/ProjectsDataTable";
import { columns } from "./_components/ProjectsColumns";
import { backend, wrapper } from "@/types/backend";

export default async function ProjectsPage()
{
    // Get all projects
    const [projects, error] = await wrapper((auth) => backend.GET("/api/Project", auth));
    if (error)
    {
        console.error(`error ${error.message}`);
        throw error;
    }

    const activeProjects = projects.filter((project) => project.isActive);  // Filtrando los proyectos activos

    const transformedProjects = activeProjects.map((project) => ({
        id: project.id || "ID no disponible", // Manejar el caso donde id puede ser undefined
        area: project.area,
        spacesCount: project.spacesCount,
        orderNumber: project.orderNumber,
        status: project.status,
        address: project.address,
        client: project.client,
        services: project.services,
        quotation: project.quotation,
    }));

    return (
        <Shell>
            <HeaderPage title="Gestión de Servicios" description="Gestiona los servicios de tu empresa" />
            <ProjectsDataTable columns={columns} data={transformedProjects} />
        </Shell>
    );
}

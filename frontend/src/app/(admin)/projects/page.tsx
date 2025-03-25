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

    const transformedProjects = projects.map((project) => ({
        id: project.id!,
        area: project.area,
        spacesCount: project.spacesCount,
        // orderNumber: project.orderNumber,
        status: project.status,
        address: project.address,
        client: project.client,
        services: project.services,
        quotation: project.quotation,
        isActive: project.isActive ?? false,
    }));

    return (
        <Shell>
            <HeaderPage title="Gestión de Servicios" description="Gestiona los servicios de tu empresa" />
            <ProjectsDataTable columns={columns} data={transformedProjects} />
        </Shell>
    );
}

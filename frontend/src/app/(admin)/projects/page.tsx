import { HeaderPage } from "@/components/common/HeaderPage";
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

    return (
        <>
            <HeaderPage title="Gestión de Servicios" description="Gestiona los servicios de tu empresa" />
            <ProjectsDataTable columns={columns} data={projects} />
        </>
    );
}

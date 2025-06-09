import { HeaderPage } from "@/components/common/HeaderPage";
import { ProjectsDataTable } from "./_components/ProjectsDataTable";
import { columns } from "./_components/ProjectsColumns";
import { backend, wrapper } from "@/types/backend";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb";

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
            <HeaderPage
                title="Gestión de Servicios"
                breadcrumbs={(
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/projects">
                                    Todos los servicios
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                )}
            />
            <ProjectsDataTable columns={columns} data={projects} />
        </>
    );
}

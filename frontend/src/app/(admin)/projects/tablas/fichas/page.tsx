import { HeaderPage } from "@/components/common/HeaderPage";
import { backend, wrapper } from "@/types/backend";
import OperationRecordsList from "./_components/ViewOperationSheet";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb";

export default async function ProjectDetail()
{
    // Obtener todas las fichas de operaciones
    const [data, err] = await wrapper((auth) => backend.GET("/api/ProjectOperationSheet/for-table", auth));
    if (err)
    {
        console.error(`error ${err.message}`);
        throw err;
    }

    return (
        <>
            <HeaderPage
                title={"Lista de Ficha de Operaciones"}
                breadcrumbs={(
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/projects/ver/ficha">
                                    Todas las Fichas de Operaciones
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                )}
            />
            <OperationRecordsList data={data} />
        </>
    );
}

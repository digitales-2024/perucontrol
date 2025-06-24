import { HeaderPage } from "@/components/common/HeaderPage";
import { backend, wrapper } from "@/types/backend";
import OperationRecordsList from "./_components/ViewOperationSheet";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb";

export default async function ProjectDetail()
{
    // Obtener todas las fichas de operaciones
    const [data, err] = await wrapper((auth) => backend.GET("/api/OperationSheet/for-table", auth));
    if (err)
    {
        console.error(`error ${err.message}`);
        throw err;
    }

    // Get available sheets for creation
    const [availableSheets, availableSheetsErr] = await wrapper((auth) => backend.GET("/api/OperationSheet/for-creation", auth));
    if (availableSheetsErr)
    {
        console.error(`error ${availableSheetsErr.message}`);
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
                                <BreadcrumbLink href="/projects/tablas/fichas">
                                    Todas las Fichas de Operaciones
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                )}
            />
            <OperationRecordsList data={data} availableSheets={availableSheets} />
        </>
    );
}

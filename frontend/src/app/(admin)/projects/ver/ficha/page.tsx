import { HeaderPage } from "@/components/common/HeaderPage";
import { backend, wrapper } from "@/types/backend";
import OperationRecordsList from "./_components/ViewOperationSheet";
import { columns } from "./_components/OperationSheetColumns";

export default async function ProjectDetail()
{
    // Obtener todas las fichas de operaciones
    const [ProjectsOperationSheet, err] = await wrapper((auth) => backend.GET("/api/Appointment/all", auth));
    if (err)
    {
        console.error(`error ${err.message}`);
        throw err;
    }

    return (
        <>
            <HeaderPage title={"Lista de Ficha de Operaciones"} />
            <OperationRecordsList columns={columns} data={ProjectsOperationSheet} />
        </>
    );
}

"use client";

// import { useRouter } from "next/navigation";
import { OperationSheetTable } from "@/components/data-table/OperationSheetDataTable";
import { components } from "@/types/api";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { toastWrapper } from "@/types/toasts";
import { GenerateOperationSheetExcel, GenerateOperationSheetPDF } from "../../../actions";

export type OperationSheetProp = components["schemas"]["GetOperationSheetsForTableOutDto"]

interface OperationRecordsListProps {
    columns: Array<ColumnDef<OperationSheetProp, unknown>>;
    data: Array<OperationSheetProp>
}

export default function OperationRecordsList({ columns, data }: OperationRecordsListProps)
{
    // const router = useRouter();

    // Status options for filtering
    const statusOptions = [
        { value: "todos", label: "Todos", count: data.length },
    ];

    // Botones de acción para cada fila
    const actionButtons = [
        {
            label: "Descargar",
            icon: (
                <Badge variant="excel">
                    Excel
                </Badge>),
            onClick: (row: OperationSheetProp) =>
            {
                downloadExcel(row.id!);
            },
            disabled: (row: OperationSheetProp) => !row.isActive,
        },
        {
            label: "Descargar",
            icon: (
                <Badge variant="pdf">
                    PDF
                </Badge>),
            onClick: (row: OperationSheetProp) =>
            {
                downloadPdf(row.id!);
            },
            disabled: (row: OperationSheetProp) => !row.isActive,
        },
    ];

    return (
        <div className="space-y-4">
            <OperationSheetTable
                columns={columns}
                data={data}
                statusOptions={statusOptions}
                statusField="statusType"
                searchFields={["treatedAreas", "insects", "rodents", "otherPlagues", "staff1", "staff2", "observations"]}
                actionButtons={actionButtons}
                dateRangeField={{
                    field: "operationDate",
                    format: "yyyy-MM-dd",
                }}
                emptyMessage="No se encontraron fichas de operación"
            // onRowClick={(record) => router.push(`/fichas-operacion/${record.id}`)}
            />
        </div>
    );
}

const downloadExcel = async(id: string) =>
{
    const [blob, err] = await toastWrapper(GenerateOperationSheetExcel(id), {
        loading: "Generando archivo",
        success: "Excel generado",
    });

    if (err)
    {
        return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cotizacion_${id}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
};

const downloadPdf = async(id: string) =>
{
    const [blob, err] = await toastWrapper(GenerateOperationSheetPDF(id), {
        loading: "Generando archivo",
        success: "Excel generado",
    });

    if (err)
    {
        return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cotizacion_${id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
};

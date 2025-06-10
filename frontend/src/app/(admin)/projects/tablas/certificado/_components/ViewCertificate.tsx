"use client";

import { OperationSheetTable } from "@/components/data-table/OperationSheetDataTable";
import { components } from "@/types/api";
import { type ColumnDef } from "@tanstack/react-table";
import { toastWrapper } from "@/types/toasts";
import { GenerateCertificatePDF, GenerateCertificateWord } from "../../../actions";

export type CertificateProp = components["schemas"]["CertificateGet"]

export interface CertificateListProps {
    columns: Array<ColumnDef<CertificateProp, unknown>>;
    data: Array<CertificateProp>
}

export default function CertificationList({ columns, data }: CertificateListProps)
{
    // Status options for filtering
    const statusOptions = [
        { value: "todos", label: "Todos", count: data.length },
    ];

    return (
        <div className="space-y-4">
            <OperationSheetTable
                columns={columns}
                data={data}
                statusOptions={statusOptions}
                statusField="statusType"
                searchFields={["treatedAreas", "insects", "rodents", "otherPlagues", "staff1", "staff2", "observations"]}
                dateRangeField={{
                    field: "operationDate",
                    format: "yyyy-MM-dd",
                }}
                emptyMessage="No se encontraron certificados"
            />
        </div>
    );
}

// TODO: not used... yet
export const downloadPdf = async(id: string) =>
{
    const [blob, err] = await toastWrapper(GenerateCertificatePDF(id), {
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

export const downloadWord = async(id: string) =>
{
    const [blob, err] = await toastWrapper(GenerateCertificateWord(id), {
        loading: "Generando archivo",
        success: "Word generado",
    });

    if (err)
    {
        return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cotizacion_${id}.docx`;
    a.click();
    URL.revokeObjectURL(url);
};

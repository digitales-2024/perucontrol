"use client";

import { OperationSheetTable } from "@/components/data-table/OperationSheetDataTable";
import { components } from "@/types/api";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
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

    // Botones de acción para cada fila
    const actionButtons = [
        {
            label: "Descargar",
            icon: (
                <Badge variant="word">
                    Word
                </Badge>),
            onClick: (row: CertificateProp) =>
            {
                downloadWord(row.projectAppointmentId!);
            },
            disabled: (row: CertificateProp) => !row.isActive,
        },
        {
            label: "Descargar",
            icon: (
                <Badge variant="pdf">
                    PDF
                </Badge>),
            onClick: (row: CertificateProp) =>
            {
                downloadPdf(row.projectAppointmentId!);
            },
            disabled: (row: CertificateProp) => !row.isActive,
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
                emptyMessage="No se encontraron certificados"
            />
        </div>
    );
}

const downloadPdf = async(id: string) =>
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

const downloadWord = async(id: string) =>
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

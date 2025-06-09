"use client";

import { OperationSheetTable } from "@/components/data-table/OperationSheetDataTable";
import { components } from "@/types/api";
import { type ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { DocumentSenderDialog } from "@/components/DocumentSenderDialog";
import { GenerateOperationSheetPdf } from "../actions";

export type OperationSheetProp = components["schemas"]["GetOperationSheetsForTableOutDto"]

interface OperationRecordsListProps {
    columns: Array<ColumnDef<OperationSheetProp, unknown>>;
    data: Array<OperationSheetProp>
}

export default function OperationRecordsList({ columns, data }: OperationRecordsListProps)
{
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [appointmentId, setAppointmentId] = useState<string | null>(null);

    // Status options for filtering
    const statusOptions = [
        { value: "todos", label: "Todos", count: data.length },
    ];

    return (
        <div className="space-y-4">
            <DocumentSenderDialog
                open={detailsDialogOpen}
                setOpen={setDetailsDialogOpen}
                documentName="Ficha de Operaciones"
                startingEmail=""
                startingNumber=""
                pdfLoadAction={async() => GenerateOperationSheetPdf(appointmentId ?? "")}
                emailSendAction={async(email) => SendQuotationPdfViaMail(quotation.id!, email)}
                whatsappSendAction={async(number) => SendQuotationPdfViaWhatsapp(quotation.id!, number)}
            />

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
                emptyMessage="No se encontraron fichas de operación"
                onRowClick={(record) =>
                {
                    setAppointmentId(record.appointmentId);
                    setDetailsDialogOpen(true);
                }}
            />
        </div>
    );
}


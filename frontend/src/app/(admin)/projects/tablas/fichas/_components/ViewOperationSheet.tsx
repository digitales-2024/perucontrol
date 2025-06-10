"use client";

import { OperationSheetTable } from "@/components/data-table/OperationSheetDataTable";
import { components } from "@/types/api";
import { useState } from "react";
import { DocumentSenderDialog } from "@/components/DocumentSenderDialog";
import { GenerateOperationSheetPdf } from "../actions";
import { SendOperationSheetPDFViaEmail, SendOperationSheetPDFViaWhatsapp } from "../../../actions";
import { columns } from "../_components/OperationSheetColumns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export type OperationSheetProp = components["schemas"]["GetOperationSheetsForTableOutDto"]

interface OperationRecordsListProps {
    data: Array<OperationSheetProp>
}

export default function OperationRecordsList({ data }: OperationRecordsListProps)
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
                emailSendAction={async(email) => SendOperationSheetPDFViaEmail(appointmentId ?? "", email)}
                whatsappSendAction={async(number) => SendOperationSheetPDFViaWhatsapp(appointmentId ?? "", number)}
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
                toolbarActions={<OperationSheetTableActions />}
            />
        </div>
    );
}

function OperationSheetTableActions()
{
    return (
        <div>
            <Dialog>
                <DialogTrigger asChild>
                    <Button>
                        <Plus />
                        Nueva ficha
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Nueva Ficha de Operaciones
                        </DialogTitle>
                        <DialogDescription>
                            Selecciona un servicio y una fecha
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    );
}

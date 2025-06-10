"use client";

import { OperationSheetTable } from "@/components/data-table/OperationSheetDataTable";
import { components } from "@/types/api";
import { useMemo, useState } from "react";
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
import { AutoComplete, Option } from "@/components/ui/autocomplete";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export type OperationSheetProp = components["schemas"]["GetOperationSheetsForTableOutDto"]
type OperationSheetAvailable = components["schemas"]["GetOperationSheetsForCreationOutDto"]
type AvailableOperationSheetAppointment = components["schemas"]["GetOperationSheetsForCreationOutDto"]["availableSheets"][number]

interface OperationRecordsListProps {
    data: Array<OperationSheetProp>
    availableSheets: Array<OperationSheetAvailable>
}

export default function OperationRecordsList({ data, availableSheets }: OperationRecordsListProps)
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
                toolbarActions={<OperationSheetTableActions availableSheets={availableSheets} />}
            />
        </div>
    );
}

function OperationSheetTableActions({ availableSheets }: { availableSheets: Array<OperationSheetAvailable> })
{
    const [selectedService, setSelectedService] = useState<OperationSheetAvailable | null>(null);
    const [selectedAppointment, setSelectedAppointment] = useState<AvailableOperationSheetAppointment | null>(null);

    const serviceOptions: Array<Option> = useMemo(
        () => availableSheets.map((available) => ({
            value: available.serviceId,
            label: `#${available.serviceNumber} - ${available.clientName}`,
        })),
        [availableSheets],
    );

    const appointmentOptions: Array<Option> = useMemo(
        () =>
        {
            if (selectedService === null) return [];

            return selectedService.availableSheets.map((available) => ({
                value: available.appoinmentId,
                label: `Fecha: ${format(parseISO(available.dueDate), "dd 'de' MMMM  'de' yyyy", { locale: es })}`,
            }));
        },
        [selectedService],
    );

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

                    <div>
                        <label htmlFor="">
                            Servicio:
                        </label>
                        <AutoComplete
                            options={serviceOptions}
                            placeholder="Selecciona un servicio"
                            emptyMessage="No se encontraron servicios con fichas pendientes"
                            value={
                                serviceOptions.find((option) => option.value === selectedService?.serviceId) ?? undefined
                            }
                            onValueChange={(option) =>
                            {
                                setSelectedService(availableSheets.find((opt) => opt.serviceId === option.value) ?? null);
                                setSelectedAppointment(null);
                            }}
                        />
                    </div>

                    <div>
                        <label htmlFor="">
                            Fecha:
                        </label>
                        <AutoComplete
                            options={appointmentOptions}
                            placeholder="Selecciona una fecha"
                            emptyMessage="No se encontraron fechas pendientes"
                            value={
                                appointmentOptions.find((option) => option.value === selectedAppointment?.appoinmentId) ?? undefined
                            }
                            onValueChange={(option) =>
                            {
                                setSelectedAppointment(selectedService?.availableSheets?.find((appt) => appt.appoinmentId === option.value) ?? null);
                            }}
                        />
                    </div>

                    <div className="text-right">
                        <Button>
                            <Plus />
                            Crear Ficha de Operaciones
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { OperationSheetTable } from "@/components/data-table/OperationSheetDataTable";
import { components } from "@/types/api";
import { toastWrapper } from "@/types/toasts";
import { certificateTableColumns } from "./CertificateColumns";
import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { AutoComplete, Option } from "@/components/ui/autocomplete";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { es } from "date-fns/locale";
import { MarkCertificateAsStarted } from "../actions";
import { DocumentSenderDialog } from "@/components/DocumentSenderDialog";
import { SendCertificatePDFViaEmail, GenerateCertificatePDF, SendCertificatePDFViaWhatsapp } from "../../../[id]/evento/[app_id]/certificado/actions";

export type GetCertificateForTableOutDto = components["schemas"]["GetCertificateForTableOutDto"]
type GetCertificateForCreationOutDtoSingle = components["schemas"]["GetCertificateForCreationOutDto"]
type GetCertificateForTableOutDtoSingle = components["schemas"]["GetCertificateForCreationOutDto"]["availableCerts"][number]

export interface CertificateListProps {
    data: Array<GetCertificateForTableOutDto>
    availableForCreation: Array<GetCertificateForCreationOutDtoSingle>
}

export default function CertificationList({ data, availableForCreation }: CertificateListProps)
{
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [certificateId, setCertificateId] = useState<string | null>(null);

    // Status options for filtering
    const statusOptions = [
        { value: "todos", label: "Todos", count: data.length },
    ];

    return (
        <div className="space-y-4">
            <DocumentSenderDialog
                open={detailsDialogOpen}
                setOpen={setDetailsDialogOpen}
                documentName="Certificado"
                startingEmail=""
                startingNumber=""
                pdfLoadAction={async() => GenerateCertificatePDF(certificateId ?? "")}
                emailSendAction={async(email) => SendCertificatePDFViaEmail(certificateId ?? "", email)}
                whatsappSendAction={async(number) => SendCertificatePDFViaWhatsapp(certificateId ?? "", number)}
            />

            <OperationSheetTable
                columns={certificateTableColumns}
                data={data}
                statusOptions={statusOptions}
                statusField="statusType"
                searchFields={["treatedAreas", "insects", "rodents", "otherPlagues", "staff1", "staff2", "observations"]}
                dateRangeField={{
                    field: "operationDate",
                    format: "yyyy-MM-dd",
                }}
                onRowClick={(record) =>
                {
                    setCertificateId(record.certificateId);
                    setDetailsDialogOpen(true);
                }}
                emptyMessage="No se encontraron certificados"
                toolbarActions={<CertificateTableActions availableForCreation={availableForCreation} />}
            />
        </div>
    );
}

function CertificateTableActions({ availableForCreation }: { availableForCreation: Array<GetCertificateForCreationOutDtoSingle> })
{
    const [selectedService, setSelectedService] = useState<GetCertificateForCreationOutDtoSingle | null>(null);
    const [selectedAppointment, setSelectedAppointment] = useState<GetCertificateForTableOutDtoSingle | null>(null);
    const [errorMsg, setErrorMsg] = useState("");

    const serviceOptions: Array<Option> = useMemo(
        () => availableForCreation.map((available) => ({
            value: available.serviceId,
            label: `#${available.serviceNumber} - ${available.clientName}`,
        })),
        [availableForCreation],
    );

    const appointmentOptions: Array<Option> = useMemo(
        () =>
        {
            if (selectedService === null) return [];

            return selectedService.availableCerts.map((available) => ({
                value: available.appoinmentId,
                label: `Fecha: ${format(parseISO(available.dueDate), "dd 'de' MMMM  'de' yyyy", { locale: es })}`,
            }));
        },
        [selectedService],
    );

    async function CreateOperationSheet()
    {
        if (selectedService === null)
        {
            setErrorMsg("Error: Selecciona un servicio");
            return;
        }
        if (selectedAppointment === null)
        {
            setErrorMsg("Error: Selecciona una fecha");
            return;
        }
        setErrorMsg("");

        const [, error] = await toastWrapper(MarkCertificateAsStarted(selectedAppointment.certificateId), {
            loading: "Creando Certificado",
            success: "Certificado creado",
        });

        if (!!error)
        {
            return;
        }

        redirect(`/projects/${selectedService.serviceId}/evento/${selectedAppointment.appoinmentId}/certificado`);
    }

    return (
        <div>
            <Dialog>
                <DialogTrigger asChild>
                    <Button>
                        <Plus />
                        Nuevo Certificado
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Nuevo Certificado
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
                            emptyMessage="No se encontraron servicios con certificados pendientes"
                            value={
                                serviceOptions.find((option) => option.value === selectedService?.serviceId) ?? undefined
                            }
                            onValueChange={(option) =>
                            {
                                setSelectedService(availableForCreation.find((opt) => opt.serviceId === option.value) ?? null);
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
                                setSelectedAppointment(selectedService?.availableCerts?.find((appt) => appt.appoinmentId === option.value) ?? null);
                            }}
                        />
                    </div>

                    <p className="text-red-400">
                        {errorMsg}
                    </p>

                    <div className="text-right">
                        <Button
                            onClick={CreateOperationSheet}
                        >
                            <Plus />
                            Crear Certificado
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

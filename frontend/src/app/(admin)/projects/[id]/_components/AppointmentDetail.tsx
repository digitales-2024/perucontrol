"use client";

import { AccordionContent, AccordionItem, AccordionTriggerAsChild } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { components } from "@/types/api";
import { parseISO } from "date-fns";
import { CheckIcon, ChevronDown, ClockArrowDown, Flag, Ellipsis, Pencil, Download } from "lucide-react";
import { useState } from "react";
import { EditAppointmentDialog } from "./EditAppointmentDialog";
import { toastWrapper } from "@/types/toasts";
import { DesactivateAppointment, EditAppointment } from "../../actions";
import { DesactiveAppointmentDialog } from "./DesactiveAppointmentDialog";
import Link from "next/link";

type ProjectSummarySingle = components["schemas"]["ProjectSummarySingle"];
type ProjectAppointment = ProjectSummarySingle["appointments"][number]

export function AppointmentDetail({
    appointment,
    projectId,
    idx,
}: {
    appointment: ProjectAppointment,
    projectId: string,
    idx: number,
})
{
    const [editDueDateOpen, setEditDueDateOpen] = useState(false);
    const [editActualDateOpen, setActualDueDateOpen] = useState(false);
    const [deactivateOpen, setDeactivateOpen] = useState(false);

    const dueDate = parseISO(appointment.dueDate);
    const dueDateStr = dueDate.toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "America/Lima",
    });

    const deliveryDate: Date | null = (!!appointment.actualDate) ? parseISO(appointment.actualDate) : null;

    async function UpdateDueDate(newDate: Date)
    {
        await toastWrapper(
            EditAppointment(projectId, appointment.id!, newDate.toISOString(), null, null),
            {
                success: "Fecha actualizada",
                loading: "Actualizando fecha...",
            },
        );
    }

    async function UpdateActualDate(newDate: Date)
    {
        await toastWrapper(
            EditAppointment(projectId, appointment.id!, null, null, newDate.toISOString()),
            {
                success: "Fecha actualizada",
                loading: "Actualizando fecha...",
            },
        );
    }

    async function Deactivate()
    {
        await toastWrapper(
            DesactivateAppointment(projectId, appointment.id!),
            {
                success: "Cita eliminada",
                loading: "Eliminando cita...",
            },
        );
    }

    return (
        <>
            <AccordionItem value={appointment.id!}>
                <AccordionTriggerAsChild asChild>
                    <button className="grid w-full grid-cols-[1.5rem_auto_2.5rem] items-center cursor-pointer">
                        {AppointmentIcon(appointment.dueDate, appointment.actualDate ?? undefined)}
                        <div className="flex items-center py-3 pl-1">
                            Fecha #
                            <b>
                                {idx + 1}
                            </b>
                            &nbsp;
                            -
                            &nbsp;
                            {dueDateStr}
                            <span className={"ml-2 inline-block h-2 w-2 rounded-full "} />
                        </div>
                        <ChevronDown className="transition-transform chevron" />
                    </button>
                </AccordionTriggerAsChild>
                <AccordionContent>

                    <div className="my-2 grid grid-cols-[2rem_auto_7rem] items-center gap-4">
                        <div className="text-center">
                            <Flag className={"inline-block"} />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-700">
                                Fecha planificada
                            </p>
                            <p className="text-lg">
                                {dueDate.toLocaleString("es-PE", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    timeZone: "America/Lima",
                                })}
                            </p>
                        </div>
                        <Button variant="outline" onClick={() => setEditDueDateOpen(true)}>
                            <Pencil />
                            Editar
                        </Button>
                    </div>
                    <div className="my-2 grid grid-cols-[2rem_auto_7rem] items-center gap-4">
                        <div className="text-center">
                            {AppointmentIcon(appointment.dueDate, appointment.actualDate ?? undefined)}
                        </div>
                        <div>
                            <p className="text-xs text-zinc-700">
                                Fecha real
                            </p>
                            <p className="text-lg">
                                {deliveryDate !== null ? (
                                    <>
                                        {
                                            deliveryDate.toLocaleString("es-PE", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                                timeZone: "America/Lima",
                                            })
                                        }
                                    </>
                                ) : (
                                    <span>
                                        Pendiente
                                    </span>
                                )}
                            </p>
                        </div>
                        <Button variant="outline" onClick={() => setActualDueDateOpen(true)}>
                            {deliveryDate === null ? (
                                <>
                                    <CheckIcon />
                                    Completar
                                </>
                            ) : (
                                <>
                                    <Pencil />
                                    Editar
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Link href={`/projects/${projectId}/evento/${appointment.id!}/certificado`}>
                            <Button
                                className="disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={deliveryDate === null}
                                title={deliveryDate === null ? "No se puede ver la ficha de operaciones si no se ha completado la fecha real" : ""}
                            >
                                <Download />
                                Certificado
                            </Button>
                        </Link>
                        <Link href={`/projects/${projectId}/evento/${appointment.id!}/ficha`}>
                            <Button
                                className="disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={deliveryDate === null}
                                title={deliveryDate === null ? "No se puede ver la ficha de operaciones si no se ha completado la fecha real" : ""}
                            >
                                <Download />
                                Ficha de Operaciones
                            </Button>
                        </Link>
                        <Button
                            onClick={() => setDeactivateOpen(true)}
                            variant="destructive"
                        >
                            Eliminar
                        </Button>
                    </div>

                </AccordionContent>
            </AccordionItem>
            <EditAppointmentDialog
                isOpen={editDueDateOpen} onClose={() => setEditDueDateOpen(false)}
                onSave={(newDate) => UpdateDueDate(newDate)}
                initialDate={dueDate}
            />
            <EditAppointmentDialog
                isOpen={editActualDateOpen} onClose={() => setActualDueDateOpen(false)}
                onSave={(newDate) => UpdateActualDate(newDate)}
                initialDate={deliveryDate ?? undefined}
            />
            <DesactiveAppointmentDialog
                isOpen={deactivateOpen}
                onClose={() => setDeactivateOpen(false)}
                onConfirm={() => Deactivate()}
            />
        </>
    );
}

function AppointmentIcon(dueDateStr: string, actualStr?: string)
{
    const status = datesToStatus(dueDateStr, actualStr);

    if (status === "Completo")
    {
        return (
            <span className="inline-block" title="Completo">
                <CheckIcon className="text-green-500" />
            </span>
        );
    }
    else if (status === "Completo con retraso")
    {
        return (
            <span className="inline-block" title="Completo con retraso">
                <CheckIcon className="text-amber-600" />
            </span>
        );
    }
    else if (status === "Pendiente")
    {
        return (
            <span className="inline-block" title="Pendiente">
                <Ellipsis />
            </span>
        );
    }
    else if (status === "Retrasado")
    {
        return (
            <span className="inline-block" title="Con retraso">
                <ClockArrowDown className="text-red-500" />
            </span>
        );
    }
}

type DateStatus = "Pendiente" | "Retrasado" | "Completo" | "Completo con retraso"
export function datesToStatus(dueDateStr: string, actualStr?: string): DateStatus
{
    const dueDate = parseISO(dueDateStr);
    const now = new Date();

    if (actualStr !== undefined)
    {
        const actual = parseISO(actualStr!);

        if (actual <= dueDate)
        {
            return "Completo";
        }
        else
        {
            return "Completo con retraso";
        }
    }
    else
    {
        if (dueDate < now)
        {
            return "Retrasado";
        }
        else
        {
            return "Pendiente";
        }
    }
}

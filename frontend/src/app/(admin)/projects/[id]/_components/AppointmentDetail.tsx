"use client";

import { Button } from "@/components/ui/button";
import { Calendar, CheckIcon, Flag, Pencil, Rat, FileIcon, ListChecks, CircleOff, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { DocumentButton } from "./DocumentButton";
import { EditAppointmentDialog } from "./EditAppointmentDialog";
import { DesactiveAppointmentDialog } from "./DesactiveAppointmentDialog";
import { components } from "@/types/api";
import { AppointmentForTable } from "./ProjectDetails";
import { Badge } from "@/components/ui/badge";
import { toastWrapper } from "@/types/toasts";
import { CancelAppointment, DesactivateAppointment, EditAppointment, UpdateAppointmentTimes } from "../../actions";
import { MurinoMapSection } from "./MurinoMapSection";

interface AppointmentDetailsProps {
    projectId: string;
    appointment: AppointmentForTable;
    project: components["schemas"]["ProjectSummarySingle"],
    services?: Array<components["schemas"]["Service"]>;
    murinoMapBase64?: string | null,
}

export function AppointmentDetails({
    projectId,
    appointment,
    project,
    murinoMapBase64,
}: AppointmentDetailsProps)
{
    const [editDueDateOpen, setEditDueDateOpen] = useState(false);
    const [editActualDateOpen, setEditActualDateOpen] = useState(false);
    const [deactivateOpen, setDeactivateOpen] = useState(false);
    const [enterTime, setEnterTime] = useState(appointment.enterTime ?? "");
    const [leaveTime, setLeaveTime] = useState(appointment.leaveTime ?? "");

    const dueDate = new Date(appointment.dueDate);
    const deliveryDate = appointment.actualDate ? new Date(appointment.actualDate) : null;

    // Determinar si las acciones están deshabilitadas
    const actionsDisabled = !appointment.actualDate;

    const servicesMap = useMemo(() =>
    {
        const map = new Map<string, string>();
        project.services.forEach((service) => map.set(service.id!, service.name));
        return map;
    }, [project]);

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

    async function ToggleCancelAppointment()
    {
        await toastWrapper(
            CancelAppointment(projectId, appointment.id!, !appointment.cancelled),
            {
                success: appointment.cancelled ? "Cita reactivada" : "Cita cancelada",
                loading: appointment.cancelled ? "Reactivando cita..." : "Cancelando cita...",
            },
        );
    }

    async function UpdateTimes()
    {
        await toastWrapper(
            UpdateAppointmentTimes(appointment.id!, enterTime ?? null, leaveTime ?? null),
            {
                success: "Horas actualizadas",
                loading: "Actualizando horas...",
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
        <div className="bg-white rounded-lg shadow p-6 space-y-6 mt-5">
            {/* Número de cita */}
            <div className="border-b pb-4">
                <h2 className="text-xl font-semibold">
                    Cita #
                    {appointment.appointmentNumber ?? "N/A"}
                </h2>
            </div>

            {/* Fechas */}
            <div className="space-y-4">
                {/* Fecha planificada */}
                <div className="grid grid-cols-1 md:grid-cols-[2rem_1fr_7rem] items-center gap-4">
                    <div className="text-center">
                        <Flag className="inline-block text-blue-500" />
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
                    <div>
                        <Button
                            variant="outline"
                            onClick={() => setEditDueDateOpen(true)}
                            className="w-full"
                        >
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                        </Button>
                    </div>
                </div>

                {/* Fecha real */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="w-8 text-center">
                        {appointment.cancelled
                            ? <XCircle className="text-red-500" />
                            : deliveryDate
                                ? <CheckIcon className="text-green-500" />
                                : <Calendar className="text-amber-500" />
                        }
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-zinc-700">
                            Fecha real
                        </p>
                        <p className="text-base break-words whitespace-normal truncate">
                            {appointment.cancelled ? (
                                <span className="text-red-500 font-medium">
                                    No realizado
                                </span>
                            ) : deliveryDate ? (
                                deliveryDate.toLocaleString("es-PE", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    timeZone: "America/Lima",
                                })
                            ) : (
                                <span className="text-zinc-400">
                                    Pendiente
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 shrink-0">
                        {/* Botón editar/completar sólo si no está cancelada */}
                        <Button
                            variant="outline"
                            onClick={() => setEditActualDateOpen(true)}
                            className="w-full"
                            disabled={appointment.cancelled}
                        >
                            {deliveryDate ? (
                                <>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Editar
                                </>
                            ) : (
                                <>
                                    <CheckIcon className="mr-2 h-4 w-4" />
                                    Completar
                                </>
                            )}
                        </Button>

                        {/* Botón cancelar/reactivar */}
                        <Button
                            variant={appointment.cancelled ? "secondary" : "destructive"}
                            onClick={ToggleCancelAppointment}
                            className="w-full"
                        >
                            {appointment.cancelled ? (
                                <>
                                    <CheckIcon className="mr-2 h-4 w-4" />
                                    Reactivar
                                </>
                            ) : (
                                <>
                                    <CircleOff className="mr-2 h-4 w-4" />
                                    No realizado
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora de entrada (Formato 12 horas)
                    </label>
                    <input
                        type="time"
                        value={enterTime}
                        onChange={(e) => setEnterTime(e.target.value)}
                        className="w-full border rounded p-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora de salida (Formato 12 horas)
                    </label>
                    <input
                        type="time"
                        value={leaveTime}
                        onChange={(e) => setLeaveTime(e.target.value)}
                        className="w-full border rounded p-2"
                    />
                </div>
                <div>
                    <Button
                        onClick={UpdateTimes}
                        disabled={appointment.cancelled}
                        className="w-full"
                    >
                        Guardar horas
                    </Button>
                </div>
            </div>

            {/* Servicios */}
            <div className="space-y-2">
                <h3 className="text-sm font-medium">
                    Servicios programados
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex flex-col justify-center gap-2 p-2 bg-gray-50 rounded">
                        {appointment.servicesIds.map((id) => (
                            <Badge key={id} variant="outline" className="text-xs bg-blue-50 mr-1 mb-1">
                                {servicesMap.get(id) ?? "-"}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>

            {/* Nueva sección: Mapa Murino */}
            <MurinoMapSection
                murinoMapBase64={murinoMapBase64}
                appointmentId={appointment.id!}
            />

            {/* Acciones */}
            <div className="flex flex-col flex-wrap sm:flex-row justify-end gap-2 pt-4 border-t">
                <DocumentButton
                    href={`/projects/${projectId}/evento/${appointment.id}/roedores`}
                    disabled={actionsDisabled}
                    disabledTitle={actionsDisabled ? "No se puede ver el registro de roedores si no se ha completado la fecha real" : ""}
                    icon={<Rat className="mr-2 h-4 w-4" />}
                >
                    Registro de roedores
                </DocumentButton>

                <DocumentButton
                    href={`/projects/${projectId}/evento/${appointment.id}/certificado`}
                    disabled={actionsDisabled}
                    disabledTitle={actionsDisabled ? "No se puede ver el certificado si no se ha completado la fecha real" : ""}
                    icon={<FileIcon className="mr-2 h-4 w-4" />}
                >
                    Certificado
                </DocumentButton>

                <DocumentButton
                    href={`/projects/${projectId}/evento/${appointment.id}/ficha`}
                    disabled={actionsDisabled}
                    disabledTitle={actionsDisabled ? "No se puede ver la ficha de operaciones si no se ha completado la fecha real" : ""}
                    icon={<ListChecks className="mr-2 h-4 w-4" />}
                >
                    Ficha de Operaciones
                </DocumentButton>

                <Button
                    onClick={() => setDeactivateOpen(true)}
                    variant="destructive"
                    className="text-xs md:text-sm"
                >
                    Eliminar
                </Button>
            </div>

            {/* Diálogos */}
            <EditAppointmentDialog
                isOpen={editDueDateOpen}
                onClose={() => setEditDueDateOpen(false)}
                onSave={(newDate) =>
                {
                    UpdateDueDate(newDate);
                    setEditDueDateOpen(false);
                }}
                text="Editar Fecha Planificada"
                initialDate={dueDate}
            />

            <EditAppointmentDialog
                isOpen={editActualDateOpen}
                onClose={() => setEditActualDateOpen(false)}
                onSave={(newDate) =>
                {
                    UpdateActualDate(newDate);
                    setEditActualDateOpen(false);
                }}
                text={deliveryDate ? "Editar Fecha Real" : "Completar Fecha Real"}
                initialDate={deliveryDate ?? new Date()}
            />

            <DesactiveAppointmentDialog
                isOpen={deactivateOpen}
                onClose={() => setDeactivateOpen(false)}
                onConfirm={() =>
                {
                    Deactivate();
                    setDeactivateOpen(false);
                }}
            />
        </div>
    );
}

"use client";

import { Button } from "@/components/ui/button";
import { Calendar, CheckIcon, Flag, Pencil, Rat, FileIcon, ListChecks, CircleOff, XCircle, Copy, Clock, Bug, Target, HelpCircle, Hash } from "lucide-react";
import { useState } from "react";
import { DocumentButton } from "./DocumentButton";
import { EditAppointmentDialog } from "./EditAppointmentDialog";
import { DesactiveAppointmentDialog } from "./DesactiveAppointmentDialog";
import { components } from "@/types/api";
import { toastWrapper } from "@/types/toasts";
import { CancelAppointment, DesactivateAppointment, EditAppointment, UpdateAppointmentTimes, DuplicateFromPreviousAppointment } from "../../actions";
import { MurinoMapSection } from "./MurinoMapSection";
import { TreatmentSummary } from "./TreatmentSummary";
import { ReportsList } from "./ReportsList";
import Link from "next/link";

interface AppointmentDetailsProps {
    projectId: string;
    appointment: components["schemas"]["AppointmentGetOutDTO"];
    project: components["schemas"]["AppointmentGetOutDTO"]["project"],
    services?: Array<components["schemas"]["Service"]>;
    murinoMapBase64?: string | null,
}

export function AppointmentDetails({
    projectId,
    appointment,
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

    async function DuplicateFromPrevious()
    {
        await toastWrapper(
            DuplicateFromPreviousAppointment(appointment.id!),
            {
                success: "Datos duplicados exitosamente desde la fecha anterior",
                loading: "Duplicando datos...",
            },
        );
    }

    return (
        <div className="bg-transparent rounded-lg shadow p-6 space-y-6 mt-5">
            {/* Número de cita */}
            <div className="border-b pb-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">
                        Fecha #
                        {appointment.orderedNumber ?? "N/A"}
                    </h2>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={DuplicateFromPrevious}
                        disabled={appointment.cancelled}
                        className="flex items-center gap-2"
                    >
                        <Copy className="h-4 w-4" />
                        Duplicar de fecha anterior
                    </Button>
                </div>
            </div>

            {/* Detalles de Fecha y Hora */}
            <div className="pt-6 border-t mt-6">
                <h3 className="text-lg font-semibold text-zinc-800 mb-4">
                    Detalles de Fecha y Hora
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Columna Izquierda: Fechas - Ahora una tarjeta */}
                    <div className="bg-white p-4 border rounded-lg shadow-sm">
                        {/* Card Header for Fechas */}
                        <div className="flex items-center gap-3 pb-3 border-b mb-4">
                            <div className="bg-sky-100 p-2 rounded-lg">
                                <Calendar className="h-6 w-6 text-sky-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-zinc-800">
                                Fechas
                            </h3>
                        </div>

                        {/* Contenido de Fechas */}
                        <div className="space-y-6">
                            {" "}
                            {/* Wrapper for content to maintain spacing with header*/}
                            {/* Fecha planificada */}
                            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3">
                                <Flag className="h-5 w-5 text-blue-500 row-span-2" />
                                <p className="text-xs text-zinc-600 col-start-2">
                                    Fecha planificada
                                </p>
                                <div className="col-start-3 row-start-1 row-span-2 flex items-center">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditDueDateOpen(true)}
                                    >
                                        <Pencil className="mr-1.5 h-4 w-4" />
                                        Editar
                                    </Button>
                                </div>
                                <p className="text-base font-medium text-zinc-800 col-start-2">
                                    {dueDate.toLocaleString("es-PE", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        timeZone: "America/Lima",
                                    })}
                                </p>
                            </div>

                            {/* Fecha real */}
                            <div className="grid grid-cols-[auto_1fr_auto] items-start gap-x-3">
                                <div className="row-span-2 flex items-center h-full pt-0.5">
                                    {appointment.cancelled ? (
                                        <XCircle className="h-5 w-5 text-red-500" />
                                    ) : deliveryDate ? (
                                        <CheckIcon className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <Calendar className="h-5 w-5 text-amber-500" />
                                    )}
                                </div>
                                <p className="text-xs text-zinc-600 col-start-2">
                                    Fecha real
                                </p>
                                <div className="col-start-3 row-start-1 row-span-2 flex flex-col gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditActualDateOpen(true)}
                                        disabled={appointment.cancelled}
                                    >
                                        {deliveryDate ? (
                                            <>
                                                <Pencil className="mr-1.5 h-4 w-4" />
                                                Editar
                                            </>
                                        ) : (
                                            <>
                                                <CheckIcon className="mr-1.5 h-4 w-4" />
                                                Completar
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant={appointment.cancelled ? "secondary" : "destructive"}
                                        size="sm"
                                        onClick={ToggleCancelAppointment}
                                    >
                                        {appointment.cancelled ? (
                                            <>
                                                <CheckIcon className="mr-1.5 h-4 w-4" />
                                                Reactivar
                                            </>
                                        ) : (
                                            <>
                                                <CircleOff className="mr-1.5 h-4 w-4" />
                                                No realizado
                                            </>
                                        )}
                                    </Button>
                                </div>
                                <div className="col-start-2 pt-0.5">
                                    {appointment.cancelled ? (
                                        <span className="text-base font-medium text-red-500">
                                            No realizado
                                        </span>
                                    ) : deliveryDate ? (
                                        <p className="text-base font-medium text-zinc-800">
                                            {deliveryDate.toLocaleString("es-PE", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                                timeZone: "America/Lima",
                                            })}
                                        </p>
                                    ) : (
                                        <span className="text-base font-medium text-zinc-500">
                                            Pendiente
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Columna Derecha: Horas - Ahora una tarjeta */}
                    <div className="bg-white p-4 border rounded-lg shadow-sm">
                        {/* Card Header for Horas */}
                        <div className="flex items-center gap-3 pb-3 border-b mb-4">
                            <div className="bg-teal-100 p-2 rounded-lg">
                                <Clock className="h-6 w-6 text-teal-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-zinc-800">
                                Horas del servicio
                            </h3>
                        </div>

                        {/* Contenido de Horas */}
                        <div className="space-y-4">
                            {" "}
                            {/* Wrapper for content to maintain spacing with header*/}
                            <div>
                                <label htmlFor="enterTimeInput" className="block text-xs font-medium text-zinc-600 mb-1">
                                    Hora de entrada
                                </label>
                                <input
                                    id="enterTimeInput"
                                    type="time"
                                    value={enterTime}
                                    onChange={(e) => setEnterTime(e.target.value)}
                                    className="w-full border rounded p-2 text-sm shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                    disabled={appointment.cancelled}
                                />
                            </div>
                            <div>
                                <label htmlFor="leaveTimeInput" className="block text-xs font-medium text-zinc-600 mb-1">
                                    Hora de salida
                                </label>
                                <input
                                    id="leaveTimeInput"
                                    type="time"
                                    value={leaveTime}
                                    onChange={(e) => setLeaveTime(e.target.value)}
                                    className="w-full border rounded p-2 text-sm shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                    disabled={appointment.cancelled}
                                />
                            </div>
                            <div>
                                <Button
                                    onClick={UpdateTimes}
                                    disabled={appointment.cancelled}
                                    className="w-full"
                                    size="sm"
                                >
                                    Guardar horas
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Ficha de operaciones */}
                    <div className="bg-white p-4 border rounded-lg shadow-sm">
                        <div className="flex items-center gap-3 pb-3 border-b mb-4">
                            <div className="bg-primary p-2 rounded-lg">
                                <Pencil className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold text-zinc-800">
                                Ficha de Operaciones
                            </h3>
                        </div>

                        {/* Contenido del Resumen */}
                        <div className="space-y-4">
                            {/* Diagnóstico */}
                            <div className="space-y-3">
                                {/* Insectos */}
                                <div className="flex gap-2 items-center">
                                    <Bug className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                    <span className="text-sm text-zinc-600">
                                        Insectos:
                                    </span>
                                    {appointment.operationSheet.insects ? (
                                        <span className="text-sm text-zinc-800">
                                            {appointment.operationSheet.insects}
                                        </span>
                                    ) : (
                                        <span className="text-sm text-zinc-600">
                                            --Sin llenar--
                                        </span>
                                    )}
                                </div>

                                {/* Roedores */}
                                <div className="flex gap-2 items-center">
                                    <Rat className="h-4 w-4 text-amber-500 flex-shrink-0" />
                                    <span className="text-sm text-zinc-600">
                                        Roedores:
                                    </span>
                                    {appointment.operationSheet.rodents ? (
                                        <span className="text-sm text-zinc-800">
                                            {appointment.operationSheet.rodents}
                                        </span>
                                    ) : (
                                        <span className="text-sm text-zinc-600">
                                            --Sin llenar--
                                        </span>
                                    )}
                                </div>

                                {/* Consumo de Roedores */}
                                <div className="flex gap-2 items-start">
                                    <ListChecks className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <span className="text-sm text-zinc-600">
                                            Consumo de Roedores:
                                        </span>
                                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                                            <div className="flex items-center gap-1">
                                                <span className="text-zinc-500">
                                                    Parcial:
                                                </span>
                                                {appointment.operationSheet.rodentConsumptionPartial ? (
                                                    <span className="text-zinc-800">
                                                        {appointment.operationSheet.rodentConsumptionPartial}
                                                    </span>
                                                ) : (
                                                    <span className="text-zinc-600 text-xs">
                                                        --Sin llenar--
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="text-zinc-500">
                                                    Total:
                                                </span>
                                                {appointment.operationSheet.rodentConsumptionTotal ? (
                                                    <span className="text-zinc-800">
                                                        {appointment.operationSheet.rodentConsumptionTotal}
                                                    </span>
                                                ) : (
                                                    <span className="text-zinc-600 text-xs">
                                                        --Sin llenar--
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="text-zinc-500">
                                                    Deteriorado:
                                                </span>
                                                {appointment.operationSheet.rodentConsumptionDeteriorated ? (
                                                    <span className="text-zinc-800">
                                                        {appointment.operationSheet.rodentConsumptionDeteriorated}
                                                    </span>
                                                ) : (
                                                    <span className="text-zinc-600 text-xs">
                                                        --Sin llenar--
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="text-zinc-500">
                                                    Ninguno:
                                                </span>
                                                {appointment.operationSheet.rodentConsumptionNone ? (
                                                    <span className="text-zinc-800">
                                                        {appointment.operationSheet.rodentConsumptionNone}
                                                    </span>
                                                ) : (
                                                    <span className="text-zinc-600 text-xs">
                                                        --Sin llenar--
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Otras plagas */}
                                <div className="flex gap-2 items-center">
                                    <Flag className="h-4 w-4 text-red-500 flex-shrink-0" />
                                    <span className="text-sm text-zinc-600">
                                        Otras plagas:
                                    </span>
                                    {appointment.operationSheet.otherPlagues ? (
                                        <span className="text-sm text-zinc-800">
                                            {appointment.operationSheet.otherPlagues}
                                        </span>
                                    ) : (
                                        <span className="text-sm text-zinc-600">
                                            --Sin llenar--
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Link
                                    href={`/projects/${projectId}/evento/${appointment.id}/ficha`}
                                >
                                    <Button
                                        disabled={appointment.cancelled}
                                        className="w-full"
                                        size="sm"
                                    >
                                        Editar Ficha de Operaciones
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Registro de Roedores */}
                    <div className="bg-white p-4 border rounded-lg shadow-sm">
                        <div className="flex items-center gap-3 pb-3 border-b mb-4">
                            <div className="bg-amber-200 p-2 rounded-lg">
                                <Rat className="h-6 w-6 text-amber-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-zinc-800">
                                Registro de Roedores
                            </h3>
                        </div>

                        {/* Contenido del Resumen */}
                        <div className="space-y-4">
                            {/* Diagnóstico */}
                            <div className="space-y-3">

                                {/* Àreas */}
                                <div className="flex gap-2 items-center">
                                    <Hash className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                    <span className="text-sm text-zinc-600">
                                        Áreas controladas
                                    </span>
                                    {appointment.operationSheet.insects ? (
                                        <span className="text-sm text-zinc-800">
                                            XX áreas
                                        </span>
                                    ) : (
                                        <span className="text-sm text-zinc-600">
                                            --Sin llenar--
                                        </span>
                                    )}
                                </div>

                                {/* Insectos */}
                                <div className="flex gap-2 items-center">
                                    <Target className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                    <span className="text-sm text-zinc-600">
                                        Incidencias
                                    </span>
                                    {appointment.operationSheet.insects ? (
                                        <span className="text-sm text-zinc-800">
                                            Incidencias de Roedores
                                        </span>
                                    ) : (
                                        <span className="text-sm text-zinc-600">
                                            --Sin llenar--
                                        </span>
                                    )}
                                </div>

                                {/* Roedores */}
                                <div className="flex gap-2 items-center">
                                    <HelpCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                                    <span className="text-sm text-zinc-600">
                                        Medidas correctivas:
                                    </span>
                                    {appointment.operationSheet.rodents ? (
                                        <span className="text-sm text-zinc-800">
                                            Medidas correctivas
                                        </span>
                                    ) : (
                                        <span className="text-sm text-zinc-600">
                                            --Sin llenar--
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Link
                                    href={`/projects/${projectId}/evento/${appointment.id}/roedores`}
                                >
                                    <Button
                                        disabled={appointment.cancelled}
                                        className="w-full"
                                        size="sm"
                                    >
                                        Editar Consumo de Roedores
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Resumen de Productos y Áreas */}
            <TreatmentSummary
                appointmentId={appointment.id!}
                treatmentAreas={appointment.treatmentAreas ?? []}
                treatmentProducts={appointment.treatmentProducts ?? []}
            />

            {/* Nueva sección: Mapa Murino */}
            <MurinoMapSection
                murinoMapBase64={murinoMapBase64}
                appointmentId={appointment.id!}
            />

            {/* Lista de Informes */}
            <ReportsList
                appointmentId={appointment.id!}
                projectId={projectId}
            />

            {/* Acciones */}
            <div className="flex flex-col flex-wrap sm:flex-row justify-end gap-2 pt-4 border-t">
                <DocumentButton
                    href={`/projects/${projectId}/evento/${appointment.id}/certificado`}
                    disabled={actionsDisabled}
                    disabledTitle={actionsDisabled ? "No se puede ver el certificado si no se ha completado la fecha real" : ""}
                    icon={<FileIcon className="mr-2 h-4 w-4" />}
                >
                    Certificado
                </DocumentButton>
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

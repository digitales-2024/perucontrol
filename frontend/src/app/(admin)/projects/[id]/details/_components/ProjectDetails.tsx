"use client";

import type { components } from "@/types/api";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    Edit,
    FileSpreadsheet,
    MapPin,
    Pencil,
    Plus,
    Shield,
    Trash2,
    User,
    XCircle,
} from "lucide-react";
import { ViewClientDetails } from "@/app/(admin)/clients/_components/ViewClientsDetail";
import { DeleteProject } from "../../../_components/DeleteProject";
import { DownloadProject } from "../../../_components/DownloadProject";
import { Label } from "@/components/ui/label";
import DatePicker from "@/components/ui/date-time-picker";
import { toast } from "sonner";
import { AddAppointment, DesactivateAppointment, EditAppointment } from "../../../actions";
import { EditAppointmentDialog } from "./EditAppointmentDialog";
import { DesactiveAppointmentDialog } from "./DesactiveAppointmentDialog";

export function ProjectDetails({ project }: { project: components["schemas"]["ProjectSummarySingle"] })
{
    const { id: projectId } = useParams();
    const router = useRouter();
    const [showClientDetails, setShowClientDetails] = useState(false);
    const [showDeleteProject, setShowDeleteProject] = useState(false);
    const [showDownload, setShowDownload] = useState(false);
    const [newDate, setNewDate] = useState<Date | undefined>(undefined);
    const [isDesactiveDialogOpen, setIsDesactiveDialogOpen] = useState(false);
    const [deletingAppointmentId, setDeletingAppointmentId] = useState<string | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<{
        id: string;
        dueDate: string;
        field?: string; // Explicitly type as string
    } | null>(null);

    // Ordenar las citas por fecha
    const sortedAppointments = project.appointments
        ? project.appointments
            .filter((appointment) => appointment.isActive)
            .sort((a, b) =>
            {
                const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
                const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
                return dateA - dateB;
            })
        : [];

    const getStatusBadge = (status: string) =>
    {
        switch (status)
        {
        case "Approved":
            return (
                <Badge variant="approved">
                    Aprobado
                </Badge>
            );
        case "Rejected":
            return (
                <Badge variant="destructive">
                    Rechazado
                </Badge>
            );
        case "Pending":
        default:
            return (
                <Badge variant="default">
                    Pendiente
                </Badge>
            );
        }
    };

    const getStatusIcon = (status: string) =>
    {
        switch (status)
        {
        case "Approved":
            return <CheckCircle2 className="h-5 w-5 text-green-500" />;
        case "Rejected":
            return <XCircle className="h-5 w-5 text-red-500" />;
        case "Pending":
        default:
            return <Clock className="h-5 w-5 text-amber-500" />;
        }
    };

    const formatDate = (dateString: string) =>
    {
        try
        {
            const date = new Date(dateString);
            return format(date, "d 'de' MMMM, yyyy", { locale: es });
        }
        catch (error)
        {
            console.log("Fecha no disponible", error);
        }
    };

    const handleGoBack = () =>
    {
        router.back();
    };

    const handleAddDate = async() =>
    {
        if (!newDate)
        {
            toast.error("Por favor seleccione una fecha para agregar");
            return;
        }

        const newDateISO = newDate.toISOString();

        // Verificar si la fecha ya existe
        const dateExists = sortedAppointments.some((appointment) => format(new Date(appointment.dueDate ?? ""), "yyyy-MM-dd") === format(newDate, "yyyy-MM-dd"));

        if (dateExists)
        {
            toast.error("Esta fecha ya está programada");
            return;
        }

        try
        {
            console.log(newDateISO);
            // Llamar a la función AddAppointment con el ID del proyecto y la nueva fecha
            const [newAppointment, error] = await AddAppointment(project.id!, newDateISO);

            if (error)
            {
                console.error("Error al agregar la cita:", error);
                toast.error("Ocurrió un error al agregar la cita");
                return;
            }

            // Actualizar la lista de citas con la nueva cita
            [...sortedAppointments, newAppointment].sort((a, b) =>
            {
                const dateA = a?.dueDate ? new Date(a.dueDate).getTime() : 0;
                const dateB = b?.dueDate ? new Date(b.dueDate).getTime() : 0;
                return dateA - dateB;
            });

            // Actualizar el estado local
            setNewDate(undefined);
            toast.success("Fecha agregada correctamente");
        }
        catch (error)
        {
            console.error("Error inesperado al agregar la cita:", error);
            toast.error("Ocurrió un error inesperado");
        }
    };

    /* const openEditDialog = (appointment: { id: string; dueDate: string, actualDate: string }) =>
    {
        setEditingAppointment(appointment);
        setIsEditDialogOpen(true);
    }; */
    const openEditDialog = (appointment: { id: string; dueDate: string; actualDate: string }, field: "dueDate" | "actualDate") =>
    {
        setEditingAppointment({ ...appointment, field });
        setIsEditDialogOpen(true);
    };

    /* const handleSaveEditedDate = async(newDate: Date) =>
    {
        if (editingAppointment)
        {
            await handleEditAppointment(editingAppointment.id, newDate, null, null);
            setEditingAppointment(null);
        }
    }; */
    const handleSaveEditedDate = async(newDate: Date) =>
    {
        if (editingAppointment)
        {
            const { id, field } = editingAppointment;

            const newDateISO = newDate.toISOString();

            try
            {
                // Llamar a EditAppointment con el campo correspondiente
                const [, error] = await EditAppointment(
                  project.id!,
                  id,
                  field === "dueDate" ? newDateISO : null,
                  null,
                  field === "actualDate" ? newDateISO : null,
                );

                if (error)
                {
                    console.error("Error al editar la cita:", error);
                    toast.error("Ocurrió un error al editar la cita");
                    return;
                }

                // Actualizar la lista de citas localmente
                project.appointments = project.appointments.map((appointment) => (appointment.id === id
                    ? {
                        ...appointment,
                        [field as string]: newDateISO, // Ensure field is treated as a string
                    }
                    : appointment));

                toast.success(`Cita actualizada correctamente (${field === "dueDate" ? "Fecha Planificada" : "Fecha Real"})`);
            }
            catch (error)
            {
                console.error("Error inesperado al editar la cita:", error);
                toast.error("Ocurrió un error inesperado");
            }
            finally
            {
                setEditingAppointment(null);
                setIsEditDialogOpen(false);
            }
        }
    };

    const openDesactiveDialog = (appointmentId: string) =>
    {
        setDeletingAppointmentId(appointmentId);
        setIsDesactiveDialogOpen(true);
    };

    const handleConfirmDelete = async() =>
    {
        if (deletingAppointmentId)
        {
            const [,error] = await DesactivateAppointment(project.id!, deletingAppointmentId);
            if (error)
            {
                console.error("Error al desactivar una cita", error);
                toast.error("Ocurrió un error al eliminar la cita");
            }
            else
            {
                toast.success("Cita eliminada correctamente");

                // Actualizar la lista de citas localmente, filtrando solo las citas activas
                project.appointments = project.appointments.map((appointment) => (appointment.id === deletingAppointmentId
                    ? { ...appointment, isActive: false }
                    : appointment));
            }
            setDeletingAppointmentId(null);
            setIsDesactiveDialogOpen(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-col space-y-6">
                {/* Cabecera con botón de regreso */}
                <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={handleGoBack} className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Volver
                    </Button>
                    <div className="flex items-center gap-2">
                        {project.isActive && (
                            <>
                                <Button
                                    variant="outline"
                                    className="hidden sm:flex items-center gap-2"
                                    onClick={() => router.push(`/projects/${projectId}/update`)}
                                >
                                    <Edit className="h-4 w-4" />
                                    Editar
                                </Button>
                                <Button
                                    variant="outline"
                                    className="hidden sm:flex items-center gap-2"
                                    onClick={() => setShowDownload(true)}
                                >
                                    <FileSpreadsheet className="h-4 w-4" />
                                    Descargar
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Tarjeta principal de información */}
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-2xl">
                                        Proyecto #
                                        {/* {project.orderNumber! ?? "Sin número"} */}
                                    </CardTitle>
                                    <div className="flex items-center">
                                        {getStatusIcon(project.status)}
                                        {getStatusBadge(project.status)}
                                    </div>
                                </div>
                                <CardDescription>
                                    Creado el
                                    {formatDate(project.createdAt!)}
                                </CardDescription>
                            </div>
                            <div className="flex sm:hidden space-x-2">
                                {project.isActive && (
                                    <>
                                        <Button variant="outline" size="icon" onClick={() => router.push(`/projects/${projectId}/update`)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="icon" onClick={() => setShowDownload(true)}>
                                            <FileSpreadsheet className="h-4 w-4" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <Tabs defaultValue="info" className="w-full">
                            <TabsList className="grid grid-cols-2 mb-4">
                                <TabsTrigger value="info">
                                    Información
                                </TabsTrigger>
                                <TabsTrigger value="schedule">
                                    Cronograma
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="info" className="space-y-6">
                                {/* Información del cliente */}
                                <div className="space-y-2">
                                    <h3 className="text-lg font-medium flex items-center gap-2">
                                        <User className="h-5 w-5 text-blue-500" />
                                        Información del Cliente
                                    </h3>
                                    <Separator />
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium text-base">
                                                    {project.client?.name === "-" ? project.client?.razonSocial : project.client?.name}
                                                </h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {project.client?.typeDocument.toUpperCase()}
:
                                                    {project.client?.typeDocumentValue}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowClientDetails(true)}
                                                className="text-blue-500"
                                            >
                                                Ver detalles
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Información del servicio */}
                                <div className="space-y-2">
                                    <h3 className="text-lg font-medium flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-blue-500" />
                                        Detalles del Servicio
                                    </h3>
                                    <Separator />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="font-medium text-sm text-muted-foreground mb-2">
                                                Servicios
                                            </h4>
                                            <div className="space-y-2">
                                                {project.services && project.services.length > 0 ? (
                                                    project.services.map((service) => (
                                                        <div key={service.id} className="flex items-center gap-2">
                                                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                                                            <span>
                                                                {service.name}
                                                            </span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-muted-foreground">
                                                        No hay servicios registrados
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="font-medium text-sm text-muted-foreground mb-2">
                                                Ubicación
                                            </h4>
                                            <div className="flex items-start gap-2">
                                                <MapPin className="h-4 w-4 text-blue-500 mt-0.5" />
                                                <span>
                                                    {project.address || "Dirección no disponible"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="font-medium text-sm text-muted-foreground mb-2">
                                                Dimensiones
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Área
                                                    </p>
                                                    <p className="font-medium">
                                                        {project.area}
                                                        {" "}
                                                        m²
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Ambientes
                                                    </p>
                                                    <p className="font-medium">
                                                        {project.spacesCount}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="font-medium text-sm text-muted-foreground mb-2">
                                                Frecuencia
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-blue-500" />
                                                <span>
                                                    {project.quotation?.frequency === "Bimonthly"
                                                        ? "Bimestral"
                                                        : project.quotation?.frequency === "Quarterly"
                                                            ? "Trimestral"
                                                            : project.quotation?.frequency === "Semiannual"
                                                                ? "Semestral"
                                                                : "No especificada"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Información de la cotización */}
                                {project.quotation && (
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-medium flex items-center gap-2">
                                            <FileSpreadsheet className="h-5 w-5 text-blue-500" />
                                            Cotización Relacionada
                                        </h3>
                                        <Separator />
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-medium">
                                                        Cotización #
                                                        {project.quotation.quotationNumber}
                                                    </h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">
                                                                Fecha de creación
                                                            </p>
                                                            <p className="text-sm">
                                                                {formatDate(project.quotation.creationDate)}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">
                                                                Fecha de expiración
                                                            </p>
                                                            <p className="text-sm">
                                                                {formatDate(project.quotation.expirationDate)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center">
                                                    {getStatusIcon(project.quotation.status)}
                                                    {getStatusBadge(project.quotation.status)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="schedule" className="space-y-6">
                                <div className="space-y-4">
                                    {/* Agregar nueva fecha */}
                                    <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                                        <div className="flex-1">
                                            <Label htmlFor="add-date" className="block mb-2">
                                                Agregar fecha
                                            </Label>
                                            <DatePicker
                                                value={newDate}
                                                onChange={setNewDate}
                                                placeholder="Seleccione fecha"
                                                className="w-full"
                                            />
                                        </div>
                                        <Button
                                            onClick={handleAddDate}
                                            size="icon"
                                            className="mt-2 sm:mt-0 bg-blue-600 hover:bg-blue-700"
                                            disabled={!newDate}
                                            type="button"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <h3 className="text-lg font-medium flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-blue-500" />
                                        Cronograma de Servicios
                                    </h3>
                                    <Separator />

                                    <div className="space-y-3">
                                        {sortedAppointments.map((appointment, index) => (
                                            <div
                                                key={appointment.id}
                                                className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-200 transition-colors"
                                            >
                                                <div className="flex justify-between items-center mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 font-medium text-sm">
                                                            {index + 1}
                                                        </div>
                                                        <h4 className="font-medium">
                                                            Servicio programado
                                                        </h4>
                                                        {appointment.orderNumber && (
                                                            <Badge variant="outline" className="ml-2">
                                                                Orden #
                                                                {appointment.orderNumber}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openDesactiveDialog(appointment.id!)}
                                                        className="h-8 w-8 text-red-500 hover:bg-red-50"
                                                        title="Eliminar cita"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {/* Columna de Fecha Planificada */}
                                                    <div className="bg-white p-3 rounded-md border border-gray-100">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Clock className="h-4 w-4 text-blue-500" />
                                                            <h4 className="font-medium text-sm">
Fecha Planificada
                                                            </h4>
                                                        </div>
                                                        <p className="text-base mb-3 pl-6">
                                                            {appointment.dueDate ? (
                                                                formatDate(appointment.dueDate)
                                                            ) : (
                                                                <span className="italic text-gray-400">
No registrada
                                                                </span>
                                                            )}
                                                        </p>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openEditDialog(
                                                                { id: appointment.id!, dueDate: appointment.dueDate!, actualDate: appointment.actualDate ?? "" },
                                                                "dueDate",
                                                            )
                                                            }
                                                            className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                                                        >
                                                            <Pencil className="h-3.5 w-3.5 mr-2" />
            Editar Fecha Planificada
                                                        </Button>
                                                    </div>

                                                    {/* Columna de Fecha Real */}
                                                    <div className="bg-white p-3 rounded-md border border-gray-100">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <CheckCircle2
                                                                className={`h-4 w-4 ${appointment.actualDate ? "text-green-500" : "text-gray-300"}`}
                                                            />
                                                            <h4 className="font-medium text-sm">
Fecha Real
                                                            </h4>
                                                        </div>
                                                        <p className="text-base mb-3 pl-6">
                                                            {appointment.actualDate ? (
                                                                formatDate(appointment.actualDate)
                                                            ) : (
                                                                <span className="italic text-gray-400">
Pendiente de registro
                                                                </span>
                                                            )}
                                                        </p>
                                                        <Button
                                                            variant={appointment.actualDate ? "outline" : "default"}
                                                            size="sm"
                                                            onClick={() => openEditDialog(
                                                                { id: appointment.id!, dueDate: appointment.dueDate ?? "", actualDate: appointment.actualDate ?? "" },
                                                                "actualDate",
                                                            )
                                                            }
                                                            className={`w-full ${
                                                                appointment.actualDate
                                                                    ? "text-green-600 border-green-200 hover:bg-green-50"
                                                                    : "bg-green-600 hover:bg-green-700 text-white"
                                                            }`}
                                                        >
                                                            {appointment.actualDate ? (
                                                                <>
                                                                    <Pencil className="h-3.5 w-3.5 mr-2" />
                    Editar Fecha Real
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Calendar className="h-3.5 w-3.5 mr-2" />
                    Registrar Fecha Real
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Botones de acción para móvil en la parte inferior */}
                <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-4 flex justify-between">
                    <Button variant="outline" onClick={handleGoBack} className="flex-1 mr-2">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </Button>
                </div>
            </div>

            {/* Modales y diálogos */}
            {project.client && (
                <ViewClientDetails
                    open={showClientDetails}
                    onOpenChange={setShowClientDetails}
                    client={project.client}
                    showTrigger={false}
                />
            )}

            <DeleteProject
                open={showDeleteProject}
                onOpenChange={setShowDeleteProject}
                project={project}
                showTrigger={false}
            />

            <DownloadProject open={showDownload} onOpenChange={setShowDownload} project={project} />

            <EditAppointmentDialog
                isOpen={isEditDialogOpen}
                onClose={() => setIsEditDialogOpen(false)}
                onSave={handleSaveEditedDate}
                initialDate={editingAppointment ? new Date(editingAppointment.dueDate) : undefined}
            />

            <DesactiveAppointmentDialog
                isOpen={isDesactiveDialogOpen}
                onClose={() => setIsDesactiveDialogOpen(false)}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}

"use client";

import type { components } from "@/types/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    Download,
    Edit,
    FileSpreadsheet,
    MapPin,
    Shield,
    User,
    XCircle,
} from "lucide-react";
import { ViewClientDetails } from "@/app/(admin)/clients/_components/ViewClientsDetail";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { DesactivateAppointment, EditAppointment, GenerateScheduleExcel, GenerateSchedulePDF } from "../../actions";
import { EditAppointmentDialog } from "./EditAppointmentDialog";
import { DesactiveAppointmentDialog } from "./DesactiveAppointmentDialog";
import { toastWrapper } from "@/types/toasts";
import { cn } from "@/lib/utils";
import { AppointmentsDataTable } from "./AppointmentsDataTable";
import { columns } from "./AppointmentsColumns";

type ServiceName = "Fumigación" | "Desinsectación" | "Desratización" | "Desinfección" | "Limpieza de tanque";

export type AppointmentForTable = {
    id?: string | undefined;
    appointmentNumber?: number | null | undefined;
    dueDate: string;
    actualDate?: string | null | undefined;
    servicesIds: Array<string>;
    services?: Array<{ name: string; id: string }>;
    isActive?: boolean;
    cancelled?: boolean/*  | null | undefined */;
    enterTime?: string | null | undefined;
    leaveTime?: string | null | undefined;
    treatmentAreas?: Array<components["schemas"]["TreatmentAreaGetDTO"]>;
    treatmentProducts?: Array<components["schemas"]["TreatmentProductDTO"]>;
};

function getServiceIcon(name: string): string
{
    const icons: Record<ServiceName, string> = {
        "Fumigación": "🐜",
        "Desinsectación": "🦟",
        "Desratización": "🐀",
        "Desinfección": "🧼",
        "Limpieza de tanque": "💧",
    };

    return name in icons ? icons[name as ServiceName] : "🔹";
}

export function ProjectDetails({
    project,
    projectId,
}: {
    project: components["schemas"]["ProjectSummarySingle"],
    projectId: string,
})
{
    const router = useRouter();
    const [showClientDetails, setShowClientDetails] = useState(false);
    const [newDate, setNewDate] = useState<Date | undefined>(undefined);
    const [isDesactiveDialogOpen, setIsDesactiveDialogOpen] = useState(false);
    const [deletingAppointmentId, setDeletingAppointmentId] = useState<string | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<{
        id: string;
        dueDate: string;
        field?: string;
    } | null>(null);
    const [selectedServices, setSelectedServices] = useState<Array<string>>([]);
    void setNewDate;

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

    const tableData: Array<AppointmentForTable> = sortedAppointments.map((appointment) => ({
        ...appointment,
        id: appointment.id!,
        appointmentNumber: appointment.appointmentNumber ?? 0,
        actualDate: appointment.actualDate ?? undefined,
        cancelled: appointment.cancelled ?? undefined,
        services: appointment.servicesIds.map((id) =>
        {
            const service = project.services.find((s) => s.id === id);
            return service ? { name: service.name, id } : { name: "Desconocido", id };
        }),
    }));

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
            const date = parseISO(dateString);
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

    const handleConfirmDelete = async() =>
    {
        if (deletingAppointmentId)
        {
            const [, error] = await DesactivateAppointment(project.id!, deletingAppointmentId);
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

    const downloadExcel = async() =>
    {
        // Genera el Excel
        const [blob, err] = await toastWrapper(GenerateScheduleExcel(projectId), {
            loading: "Generando archivo",
            success: "Excel generado",
            error: (e) => `Error al generar el Excel: ${e.message}`,
        });

        if (err)
        {
            console.error("Error al generar el Excel:", err);
            return;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `cronograma-${projectId.substring(0, 4)}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const downloadPDF = async() =>
    {
        const [blob, err] = await toastWrapper(GenerateSchedulePDF(projectId), {
            loading: "Generando archivo",
            success: "Excel generado",
            error: (e) => `Error al generar el Excel: ${e.message}`,
        });

        if (err)
        {
            console.error("Error al generar el Excel:", err);
            return;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `cronograma_${projectId.substring(0, 4)}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="container mx-auto md:p-4 p-1 space-y-6">
            <div className="flex flex-col space-y-6">
                {/* Cabecera con botón de regreso */}

                {/* Tarjeta principal de información */}
                <Card>
                    <CardHeader className="pb-2">
                        <div className="grid grid-cols-[auto_5rem_5rem] sm:items-center gap-4">
                            <div>
                                <div className="flex flex-wrap items-center gap-4">
                                    <CardTitle className="text-xl md:text-2xl">
                                        Servicio #
                                        {" "}
                                        {project.projectNumber}
                                    </CardTitle>
                                </div>
                                <CardDescription>
                                    Creado el&nbsp;
                                    {formatDate(project.createdAt ?? "")}
                                </CardDescription>
                            </div>

                            {project.isActive && (
                                <Button
                                    variant="outline"
                                    className="hidden sm:flex items-center gap-2"
                                    onClick={() => router.push(`/projects/${projectId}/update`)}
                                >
                                    <Edit className="h-4 w-4" />
                                    Editar
                                </Button>
                            )}
                            <Button
                                type="button"
                                onClick={() => router.push(`/projects/${projectId}/evento/documentos`)}
                            >
                                <Download className="h-4 w-4" />
                                Informes
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {/* Información del cliente */}
                        <div className="space-y-2 mt-4">
                            <h3 className="text-sm md:text-lg font-medium flex items-center gap-2">
                                <User className="h-5 w-5 text-blue-500" />
                                Información del Cliente
                            </h3>
                            <Separator />
                            <div className="bg-gray-50 dark:bg-background p-4 rounded-lg">
                                <div className="flex flex-wrap justify-between items-start">
                                    <div>
                                        <h4 className="font-medium text-xs md:text-base">
                                            {project.client?.name === "-" ? project.client?.razonSocial : project.client?.name}
                                        </h4>
                                        <p className="text-xs md:text-sm text-muted-foreground">
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
                        <div className="space-y-2 mt-4">
                            <h3 className="text-sm md:text-lg font-medium flex items-center gap-2">
                                <Shield className="h-5 w-5 text-blue-500" />
                                Detalles del Servicio
                            </h3>
                            <Separator />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 dark:bg-background p-4 rounded-lg">
                                    <h4 className="font-medium text-sm text-muted-foreground mb-2">
                                        Servicios
                                    </h4>
                                    <div className="space-y-2">
                                        {project.services && project.services.length > 0 ? (
                                            project.services.map((service) => (
                                                <div key={service.id} className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                                                    <span className="text-xs md:text-base">
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

                                <div className="bg-gray-50 dark:bg-background p-4 rounded-lg">
                                    <h4 className="font-medium text-sm text-muted-foreground mb-2">
                                        Ubicación
                                    </h4>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-4 w-4 text-blue-500 mt-0.5" />
                                        <span className="text-xs md:text-base">
                                            {project.address || "Dirección no disponible"}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-background p-4 rounded-lg">
                                    <h4 className="font-medium text-sm text-muted-foreground mb-2">
                                        Dimensiones
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Área
                                            </p>
                                            <p className="text-sm md:text-base font-medium">
                                                {project.area}
                                                {" "}
                                                m²
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Ambientes
                                            </p>
                                            <p className="text-sm md:text-base font-medium">
                                                {project.spacesCount}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-background p-4 rounded-lg">
                                    <h4 className="font-medium text-sm text-muted-foreground mb-2">
                                        Frecuencia
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-blue-500" />
                                        <span className="text-xs md:text-base">
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

                                <div className="bg-gray-50 dark:bg-background p-4 rounded-lg">
                                    <h4 className="font-medium text-sm text-muted-foreground mb-2">
                                        Ambientes
                                    </h4>
                                    <div className="space-y-2">
                                        {project.ambients && project.ambients.length > 0 ? (
                                            project.ambients.map((ambient, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                                                    <span className="text-xs md:text-base">
                                                        {ambient}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-muted-foreground">
                                                No hay ambientes registrados
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Botones de descarga Excel/PDF */}
                                <div className="bg-gray-50 dark:bg-background p-4 rounded-lg flex flex-col gap-2 md:col-span-2">
                                    <h4 className="font-medium text-sm text-muted-foreground mb-2">
                                        Exportar cronograma
                                    </h4>
                                    <div className="flex flex-wrap gap-4">
                                        <Button
                                            type="button"
                                            onClick={async() =>
                                            {
                                                downloadExcel();
                                            }}
                                            className="bg-green-700 hover:bg-green-800 flex items-center gap-2 px-6 py-2"
                                        >
                                            <Download className="h-4 w-4" />
                                            Descargar Excel
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={async() =>
                                            {
                                                downloadPDF();
                                            }}
                                            className="bg-red-700 hover:bg-red-800 flex items-center gap-2 px-6 py-2"
                                        >
                                            <Download className="h-4 w-4" />
                                            Descargar PDF
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Información de la cotización */}
                        {project.quotation && (
                            <div className="space-y-2 mt-5">
                                <h3 className="text-sm md:text-lg font-medium flex items-center gap-2">
                                    <FileSpreadsheet className="h-5 w-5 text-blue-500" />
                                    Cotización Relacionada
                                </h3>
                                <Separator />
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex flex-wrap gap-2 justify-between items-start">
                                        <div>
                                            <h4 className="font-medium text-base md:text-xl">
                                                Cotización #
                                                {project.quotation.quotationNumber}
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Fecha de creación
                                                    </p>
                                                    <p className="text-xs">
                                                        {formatDate(project.quotation.creationDate)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Fecha de expiración
                                                    </p>
                                                    <p className="text-xs">
                                                        {formatDate(project.quotation.expirationDate)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            {getStatusIcon(project.quotation.status)}
                                            {getStatusBadge(project.quotation.status)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex flex-wrap gap-4 justify-between">
                            <h3 className="text-base md:text-lg font-medium flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-blue-500" />
                                Cronograma de Servicios
                            </h3>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="space-y-4">
                            {/* Selector de servicios */}
                            {newDate && (
                                <div className="bg-gray-50 dark:bg-background p-4 rounded-lg">
                                    <Label className="block mb-3 text-sm font-medium">
                                        Servicios
                                    </Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {project.services.map((service) =>
                                        {
                                            const isSelected = selectedServices.includes(service.id!);
                                            return (
                                                <div
                                                    key={service.id}
                                                    className={cn(
                                                        "relative flex items-center p-2 rounded-lg border-2 cursor-pointer transition-all",
                                                        "hover:border-blue-400 hover:bg-blue-50",
                                                        isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200",
                                                    )}
                                                    onClick={() =>
                                                    {
                                                        setSelectedServices((prev) => (isSelected
                                                            ? prev.filter((id) => id !== service.id)
                                                            : [...prev, service.id!]));
                                                    }}
                                                >
                                                    <div className="mr-3 text-lg">
                                                        {getServiceIcon(service.name)}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-medium">
                                                            {service.name}
                                                        </h3>
                                                    </div>
                                                    {isSelected && <div className="absolute top-2 right-2 h-3 w-3 bg-blue-500 rounded-full" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                <AppointmentsDataTable
                                    columns={columns}
                                    data={tableData}
                                    projectId={projectId}
                                />
                            </div>

                        </div>
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

            <EditAppointmentDialog
                isOpen={isEditDialogOpen}
                onClose={() => setIsEditDialogOpen(false)}
                onSave={handleSaveEditedDate}
                initialDate={editingAppointment ? new Date(editingAppointment.dueDate) : undefined}
                text={"Editar fecha"}
            />

            <DesactiveAppointmentDialog
                isOpen={isDesactiveDialogOpen}
                onClose={() => setIsDesactiveDialogOpen(false)}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}

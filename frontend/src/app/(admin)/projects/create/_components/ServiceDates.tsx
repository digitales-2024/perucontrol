import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { format, addMonths } from "date-fns";
import DatePicker from "@/components/ui/date-time-picker";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFormContext, useWatch } from "react-hook-form";
import { components } from "@/types/api";

import { ServiceSelector } from "./ServiceSelector";
import { EditDateDialog } from "./EditDateDialog";
import { AppointmentList } from "./AppointmentList";

type AppointmentWithServices = {
    dueDate: string;
    services: Array<string>;
};

type FrequencyType = "Bimonthly" | "Quarterly" | "Semiannual" | "Monthly" | "Fortnightly"

export function ServiceDates({
    services,
    enabledServices,
}: {
    services: Array<components["schemas"]["Service"]>
    enabledServices: Array<string>;
})
{
    const { setValue, watch } = useFormContext();
    const appointments: Array<AppointmentWithServices> = useWatch({ name: "appointments" }) ?? [];
    const serviceDate = watch("serviceDate");
    const frequency = watch("frequency");
    // const [newDate, setNewDate] = useState<Date | undefined>(undefined);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const isMobile = useIsMobile();
    const [selectedServiceIds, setSelectedServiceIds] = useState<Array<string>>([]);
    const [availableServices, setAvailableServices] = useState<Array<components["schemas"]["Service"]>>([]);

    // Memoize this function so it doesn't change on every render
    const getServiceName = useCallback((serviceId: string) =>
    {
        const service = services.find((s) => s.id === serviceId);
        return service ? service.name : "Servicio desconocido";
    }, [services]);

    const updateAvailableServices = useCallback(() =>
    {
        const assignedServiceIds = appointments.flatMap((appointment) => appointment.services);
        const updatedServices = services.filter((service) => enabledServices.includes(service.id!) &&
            !assignedServiceIds.includes(service.id!));
        setAvailableServices(updatedServices);
    }, [appointments, services, enabledServices]);

    useEffect(() =>
    {
        updateAvailableServices();
    }, [updateAvailableServices]);

    // Update when enabled services change
    useEffect(() =>
    {
        const filteredServices = services.filter((service) => enabledServices.includes(service.id!));
        setAvailableServices(filteredServices);
    }, [enabledServices, services]);

    const generateDates = useCallback((
        startDate: Date,
        frequency: FrequencyType,
    ): Array<AppointmentWithServices> =>
    {
        if (selectedServiceIds.length === 0)
        {
            toast.error("Debe seleccionar al menos un servicio");
            return [];
        }

        const dates: Array<AppointmentWithServices> = [];
        const endDate = addMonths(startDate, 12); // Límite = 1 año desde el inicio
        let currentDate = new Date(startDate); // hacemos una copia para no modificar el original

        while (currentDate < endDate)
        {
            dates.push({
                dueDate: currentDate.toISOString(),
                services: [...selectedServiceIds],
            });

            // Calculamos la siguiente fecha, siempre creando una nueva instancia
            switch (frequency)
            {
            case "Fortnightly":
                currentDate = new Date(currentDate);
                currentDate.setDate(currentDate.getDate() + 15);
                break;
            case "Monthly":
                currentDate = addMonths(currentDate, 1);
                break;
            case "Bimonthly":
                currentDate = addMonths(currentDate, 2);
                break;
            case "Quarterly":
                currentDate = addMonths(currentDate, 3);
                break;
            case "Semiannual":
                currentDate = addMonths(currentDate, 6);
                break;
            }
        }

        return dates;
    }, [selectedServiceIds]);

    const handleProgramService = useCallback(() =>
    {
        if (!serviceDate || !frequency)
        {
            toast.error("Por favor seleccione una fecha de servicio");
            return;
        }

        if (!frequency)
        {
            toast.error("Por favor seleccione una frecuencia");
            return;
        }

        const generatedDates = generateDates(serviceDate, frequency as FrequencyType);
        setValue("appointments", [...appointments, ...generatedDates]);
        setSelectedServiceIds([]); // Limpiar los servicios seleccionados después de programar
        toast.success("Fechas generadas correctamente");
    }, [serviceDate, frequency, generateDates, setValue, appointments]);

    // const handleAddDate = useCallback(() =>
    // {
    //     if (!newDate)
    //     {
    //         toast.error("Por favor seleccione una fecha para agregar");
    //         return;
    //     }
    //
    //     if (selectedServiceIds.length === 0)
    //     {
    //         toast.error("Debe seleccionar al menos un servicio");
    //         return;
    //     }
    //
    //     const newAppointment = {
    //         dueDate: newDate.toISOString(), // Convertir a formato ISO
    //         services: [...selectedServiceIds],
    //     };
    //
    //     setValue("appointments", [...appointments, newAppointment]);
    //     setNewDate(undefined); // Limpiar la fecha nueva después de agregar
    //     setSelectedServiceIds([]);
    //     toast.success("Fecha agregada correctamente");
    // }, [newDate, selectedServiceIds, setValue, appointments]);

    const handleDeleteDate = useCallback((index: number) =>
    {
        const removedAppointment = appointments[index];
        const updatedDates = appointments.filter((_, i) => i !== index);
        setValue("appointments", updatedDates);

        // Agregar los servicios de la fecha eliminada de vuelta a la lista de servicios disponibles
        const updatedServices = [
            ...availableServices,
            ...services.filter((service) => removedAppointment.services.includes(service.id!)),
        ];

        // Eliminar duplicados
        const uniqueServices = Array.from(new Set(updatedServices.map((s) => s.id))).map((id) => updatedServices.find((s) => s.id === id));

        setAvailableServices(uniqueServices.filter((service): service is NonNullable<typeof service> => service !== undefined));
        toast.success("Fecha eliminada correctamente");
    }, [appointments, setValue, availableServices, services]);

    const handleEditDate = useCallback((index: number) =>
    {
        setEditingIndex(index);
        const appointment = appointments[index];
        setSelectedServiceIds(appointment.services); // Establecer los servicios de la cita en el estado
        setIsEditDialogOpen(true);
    }, [appointments]);

    const handleServiceSelection = useCallback((serviceId: string) =>
    {
        setSelectedServiceIds((prev) => (prev.includes(serviceId)
            ? prev.filter((id) => id !== serviceId)
            : [...prev, serviceId]));
    }, []);

    const handleSaveEdit = useCallback((updatedDate: Date | undefined) =>
    {
        if (!updatedDate || editingIndex === null)
        {
            toast.error("Por favor seleccione una fecha válida");
            return;
        }

        // Validar que los servicios seleccionados estén habilitados
        const invalidServices = selectedServiceIds.filter((id) => !enabledServices.includes(id));

        if (invalidServices.length > 0)
        {
            toast.error("Algunos servicios seleccionados no están habilitados");
            return;
        }

        const updatedDateISO = updatedDate.toISOString();

        // Verificar si la fecha ya existe (excepto la que estamos editando)
        const dateExists = appointments.some((appointment, index) => index !== editingIndex &&
            format(new Date(appointment.dueDate), "yyyy-MM-dd") === format(updatedDate, "yyyy-MM-dd"));

        if (dateExists)
        {
            toast.error("Esta fecha ya está programada");
            return;
        }

        const updatedDates = [...appointments];
        updatedDates[editingIndex] = {
            dueDate: updatedDateISO,
            services: [...selectedServiceIds], // Ensure services are updated as well
        };
        setValue("appointments", updatedDates);

        setIsEditDialogOpen(false);
        setEditingIndex(null);
        setSelectedServiceIds([]);
        toast.success("Fecha actualizada correctamente");
    }, [editingIndex, selectedServiceIds, enabledServices, appointments, setValue]);

    // Calculate available services for the edit dialog
    const dialogServices = React.useMemo(() =>
    {
        if (editingIndex === null) return services.filter((s) => enabledServices.includes(s.id!));

        // Get the current appointment's services
        const currentAppointmentServices = appointments[editingIndex]?.services || [];

        // Return all enabled services plus any services that are already selected in this appointment
        return services.filter((s) => enabledServices.includes(s.id!) ||
            currentAppointmentServices.includes(s.id!));
    }, [services, enabledServices, editingIndex, appointments]);

    const handleCancelEdit = useCallback(() =>
    {
        setIsEditDialogOpen(false);
        setSelectedServiceIds([]);
    }, []);

    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2 text-blue-500" />
                    Cronograma de Servicios
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <ServiceSelector
                    availableServices={availableServices}
                    selectedServiceIds={selectedServiceIds}
                    onServiceSelection={handleServiceSelection}
                    getServiceName={getServiceName}
                />

                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                        <div className="flex-1">
                            <Label htmlFor="service-date" className="block mb-2 font-medium">
                                Fecha Inicial
                            </Label>
                            <DatePicker
                                value={serviceDate}
                                onChange={(date) => setValue("serviceDate", date)}
                                placeholder="Seleccione fecha"
                                className="w-full"
                                iconColor="text-blue-500"
                            />
                        </div>
                        <div>
                            <Label htmlFor="frequency" className="block mb-2 font-medium">
                                Frecuencia
                            </Label>
                            <Select
                                value={frequency}
                                onValueChange={(value) => setValue("frequency", value as FrequencyType)}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Frecuencia" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Fortnightly">
                                        Quincenal
                                    </SelectItem>
                                    <SelectItem value="Monthly">
                                        Mensual
                                    </SelectItem>
                                    <SelectItem value="Bimonthly">
                                        Bimestral
                                    </SelectItem>
                                    <SelectItem value="Quarterly">
                                        Trimestral
                                    </SelectItem>
                                    <SelectItem value="Semiannual">
                                        Semestral
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-start">
                        <Button
                            type="button"
                            onClick={handleProgramService}
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={!serviceDate || !frequency || selectedServiceIds.length === 0}
                        >
                            Programar Servicio
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    {/*
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                        <div className="flex-1">
                            <Label htmlFor="add-date" className="block mb-2 font-medium">
                                Agregar fecha
                            </Label>
                            <DatePicker
                                value={newDate}
                                onChange={setNewDate}
                                placeholder="Seleccione fecha"
                                className="w-full"
                                iconColor="text-blue-500"
                            />
                        </div>
                        <Button
                            onClick={handleAddDate}
                            size="icon"
                            className="mt-2 sm:mt-0 bg-blue-600 hover:bg-blue-700"
                            disabled={!newDate || selectedServiceIds.length === 0}
                            type="button"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    */}

                    <AppointmentList
                        appointments={appointments}
                        onEditDate={handleEditDate}
                        onDeleteDate={handleDeleteDate}
                        getServiceName={getServiceName}
                        isMobile={isMobile}
                    />
                </div>
            </CardContent>

            <EditDateDialog
                isOpen={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                initialDate={editingIndex !== null ? new Date(appointments[editingIndex]?.dueDate) : undefined}
                selectedServiceIds={selectedServiceIds}
                onServiceSelection={handleServiceSelection}
                onSave={handleSaveEdit}
                onCancel={handleCancelEdit}
                services={dialogServices}
                isMobile={isMobile}
                getServiceName={getServiceName}
            />
        </Card>
    );
}

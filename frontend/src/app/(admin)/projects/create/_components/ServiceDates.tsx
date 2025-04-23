"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Plus, Trash2, Edit, ListChecks, CheckCircle2 } from "lucide-react";
import { format, addMonths } from "date-fns";
import { es } from "date-fns/locale";
import DatePicker from "@/components/ui/date-time-picker";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useFormContext } from "react-hook-form";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { components } from "@/types/api";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type AppointmentWithServices = {
    dueDate: string;
    services: Array<string>;
};

type FrequencyType = "Bimonthly" | "Quarterly" | "Semiannual" | "Monthly" | "Fortnightly"

export function ServiceDates({ services, enabledServices }:
    {
        services: Array<components["schemas"]["Service"]>
        enabledServices: Array<string>;
    })
{
    const { setValue, watch } = useFormContext();
    const appointments: Array<AppointmentWithServices> = watch("appointments") ?? []; // Ahora será un array de objetos AppointmentWithServices
    const serviceDate = watch("serviceDate");
    const frequency = watch("frequency");
    const [newDate, setNewDate] = useState<Date | undefined>(undefined);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const isMobile = useIsMobile();
    const [selectedServiceIds, setSelectedServiceIds] = useState<Array<string>>([]);
    /* const [availableServices, setAvailableServices] = useState(services); */
    const [availableServices, setAvailableServices] = useState(services.filter((service) => enabledServices.includes(service.id!)));

    // Efecto para actualizar los servicios disponibles cada vez que cambien las citas
    useEffect(() =>
    {
        updateAvailableServices();

    }, [appointments]);

    // Actualizar cuando cambien los servicios habilitados
    useEffect(() =>
    {
        setAvailableServices(services.filter((service) => enabledServices.includes(service.id!)));
    }, [enabledServices, services]);

    const generateDates = (startDate: Date, frequency: FrequencyType): Array<AppointmentWithServices> =>
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
    };

    /* const updateAvailableServices = () =>
    {
        const assignedServiceIds = appointments.flatMap((appointment) => appointment.services);
        const updatedServices = services.filter((service) => !assignedServiceIds.includes(service.id!));
        setAvailableServices(updatedServices);
    }; */
    const updateAvailableServices = () =>
    {
        const assignedServiceIds = appointments.flatMap((appointment) => appointment.services);
        const updatedServices = services
            .filter((service) => enabledServices.includes(service.id!) &&
              !assignedServiceIds.includes(service.id!));
        setAvailableServices(updatedServices);
    };

    const handleProgramService = () =>
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
    };

    const handleAddDate = () =>
    {

        if (!newDate)
        {
            toast.error("Por favor seleccione una fecha para agregar");
            return;
        }

        const newAppointment = {
            dueDate: newDate.toISOString(), // Convertir a formato ISO
            services: [...selectedServiceIds],
        };
        // Verificar si la fecha ya existe
        setValue("appointments", [...appointments, newAppointment]);
        setNewDate(undefined); // Limpiar la fecha nueva después de agregar
        setSelectedServiceIds([]);
        toast.success("Fecha agregada correctamente");
    };

    const handleDeleteDate = (index: number) =>
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
    };

    const handleEditDate = (index: number) =>
    {
        setEditingIndex(index);
        setIsEditDialogOpen(true);
    };

    const handleServiceSelection = (serviceId: string) =>
    {
        setSelectedServiceIds((prev) => (prev.includes(serviceId)
            ? prev.filter((id) => id !== serviceId) // Desmarcar
            : [...prev, serviceId]));
    };

    const handleSaveEdit = (updatedDate: Date | undefined) =>
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
        toast.success("Fecha actualizada correctamente");
    };

    // Función para obtener el nombre de un servicio por su ID
    const getServiceName = (serviceId: string) =>
    {
        const service = services.find((s) => s.id === serviceId);
        return service ? service.name : "Servicio desconocido";
    };

    // Componente para mostrar los servicios seleccionados como badges
    const ServiceBadges = ({ serviceIds }: { serviceIds: Array<string> }) => (
        <div className="flex flex-wrap gap-1 mt-1">
            {serviceIds.map((serviceId) => (
                <Badge key={serviceId} variant="outline" className="text-xs bg-blue-50">
                    {getServiceName(serviceId)}
                </Badge>
            ))}
        </div>
    );

    const formatDate = (dateISO: string) => format(new Date(dateISO), "d 'de' MMMM, yyyy", { locale: es });

    const EditDateDialog = () =>
    {
        const initialDate =
            editingIndex !== null && appointments[editingIndex] ? new Date(appointments[editingIndex].dueDate) : undefined;
        const [tempDate, setTempDate] = useState<Date | undefined>(initialDate);

        const dialogContent = (
            <>
                <div className="py-4">
                    <Label className="block mb-2 font-medium">
                        Fecha
                    </Label>
                    <DatePicker value={tempDate} onChange={setTempDate} placeholder="Seleccione nueva fecha" className="w-full" />
                </div>

                <div className="py-2">
                    <Label className="block mb-2 font-medium">
                        Servicios a realizar
                    </Label>
                    <div className="space-y-2 max-h-60 overflow-y-auto p-3 border rounded-md bg-gray-50">
                        {availableServices.map((service) => (
                            <div key={service.id} className="flex items-center space-x-2 p-1.5 hover:bg-gray-100 rounded-md">
                                <Checkbox
                                    id={`edit-service-${service.id}`}
                                    checked={selectedServiceIds.includes(service.id!)}
                                    onCheckedChange={() => handleServiceSelection(service.id!)}
                                    className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                                />
                                <Label htmlFor={`edit-service-${service.id}`} className="text-sm cursor-pointer">
                                    {service.name}
                                </Label>
                            </div>
                        ))}
                    </div>
                    {selectedServiceIds.length > 0 && (
                        <div className="mt-2">
                            <Label className="text-xs text-muted-foreground">
                                Servicios seleccionados:
                            </Label>
                            <ServiceBadges serviceIds={selectedServiceIds} />
                        </div>
                    )}
                </div>
            </>
        );

        if (isMobile)
        {
            return (
                <Drawer open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle>
                                Editar fecha y servicios
                            </DrawerTitle>
                        </DrawerHeader>
                        <div className="px-4">
                            {dialogContent}
                        </div>
                        <DrawerFooter className="flex-row gap-3 pt-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() =>
                                {
                                    setIsEditDialogOpen(false);
                                    // Restaurar los servicios seleccionados al cancelar
                                    setSelectedServiceIds([]);
                                }}
                                type="button"
                            >
                                Cancelar
                            </Button>
                            <Button
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                                onClick={() => handleSaveEdit(tempDate)}
                                type="button"
                                disabled={!tempDate || selectedServiceIds.length === 0}
                            >
                                Guardar
                            </Button>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            );
        }

        return (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            Editar fecha y servicios
                        </DialogTitle>
                    </DialogHeader>
                    {dialogContent}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() =>
                            {
                                setIsEditDialogOpen(false);
                                // Restaurar los servicios seleccionados al cancelar
                                setSelectedServiceIds([]);
                            }}
                            type="button"
                        >
                            Cancelar
                        </Button>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleSaveEdit(tempDate)}
                            type="button"
                            disabled={!tempDate || selectedServiceIds.length === 0}
                        >
                            Guardar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2 text-blue-500" />
                    Cronograma de Servicios
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <Card className="border border-blue-100 bg-blue-50/30">
                    <CardHeader className="py-3">
                        <CardTitle className="text-md font-medium flex items-center">
                            <ListChecks className="h-4 w-4 mr-2 text-blue-500" />
                            Seleccionar Servicios
                        </CardTitle>
                    </CardHeader>
                    <Separator className="bg-blue-100" />
                    <CardContent className="pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {availableServices.map((service) => (
                                <div
                                    key={service.id}
                                    className="flex items-center space-x-2 p-2 rounded-md border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-colors"
                                >
                                    <Checkbox
                                        id={`service-${service.id}`}
                                        checked={selectedServiceIds.includes(service.id!)}
                                        onCheckedChange={() => handleServiceSelection(service.id!)}
                                        className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                                    />
                                    <Label
                                        htmlFor={`service-${service.id}`}
                                        className="text-sm cursor-pointer flex-1 truncate"
                                    >
                                        {service.name}
                                    </Label>
                                </div>
                            ))}
                        </div>
                        {selectedServiceIds.length > 0 && (
                            <div className="mt-4 p-2 bg-blue-50 rounded-md border border-blue-100">
                                <div className="flex items-center text-sm text-blue-700 mb-1">
                                    <CheckCircle2 className="h-4 w-4 mr-1 text-blue-500" />
                                    <span>
                                        Servicios seleccionados:
                                    </span>
                                </div>
                                <ServiceBadges serviceIds={selectedServiceIds} />
                            </div>
                        )}
                    </CardContent>
                </Card>

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
                            <Select value={frequency} onValueChange={(value) => setValue("frequency", value as FrequencyType)}>
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

                    <div>
                        <Label className="block mb-2 font-medium">
                            Fechas programadas
                        </Label>
                        <Card className="border border-gray-200">
                            <ScrollArea className={isMobile ? "h-[15rem]" : "h-[40rem]"}>
                                <div className="p-2">
                                    {appointments.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-4">
                                            No hay fechas programadas
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {appointments.map((appointment: AppointmentWithServices, index: number) => (
                                                <div
                                                    key={index}
                                                    className="flex flex-col p-3 border rounded-md hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <CalendarIcon className="h-4 w-4 mr-2 text-blue-500" />
                                                            <span className="font-medium">
                                                                {formatDate(appointment.dueDate)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                type="button"
                                                                onClick={() => handleEditDate(index)}
                                                                className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                type="button"
                                                                onClick={() => handleDeleteDate(index)}
                                                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {appointment.services && appointment.services.length > 0 && (
                                                        <div className="mt-2 pl-6">
                                                            <div className="flex items-center text-xs text-muted-foreground mb-1">
                                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                                <span>
                                                                    Servicios programados:
                                                                </span>
                                                            </div>
                                                            <ServiceBadges serviceIds={appointment.services} />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </Card>
                    </div>
                </div>
            </CardContent>

            <EditDateDialog />
        </Card>
    );
}

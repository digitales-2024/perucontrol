"use client";

import { useState } from "react";
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
  date: string;
  services: Array<string>;
};

type FrequencyType = "Bimonthly" | "Quarterly" | "Semiannual" | "Monthly" | "Fortnightly"

export function ServiceDates({ services }:
  {
    services: Array<components["schemas"]["Service"]>
  })
{
    const { setValue, watch } = useFormContext();
    const appointments = watch("appointments") ?? []; // Ahora será un array de strings ISO
    const serviceDate = watch("serviceDate");
    const frequency = watch("frequency");
    const [newDate, setNewDate] = useState<Date | undefined>(undefined);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const isMobile = useIsMobile();
    const [selectedServiceIds, setSelectedServiceIds] = useState<Array<string>>([]);

    // Función para generar fechas basadas en la frecuencia
    // const generateDates = (startDate: Date, frequency: FrequencyType): Array<string> =>
    // {
    //     const dates: Array<string> = [];
    //     let currentDate = new Date(startDate);
    //     const currentYear = new Date().getFullYear();

    //     while (currentDate.getFullYear() <= currentYear)
    //     {
    //         dates.push(currentDate.toISOString());

    //         // Determinar cuántos meses agregar según la frecuencia
    //         /* const monthsToAdd = frequency === "Bimonthly" ? 2 : frequency === "Quarterly" ? 3 : 6;
    //         currentDate = addMonths(currentDate, monthsToAdd); */
    //         // Determinar cuántos días o meses agregar según la frecuencia
    //         if (frequency === "Fortnightly")
    //         {
    //             currentDate.setDate(currentDate.getDate() + 15); // Agregar 15 días
    //         }
    //         else if (frequency === "Monthly")
    //         {
    //             currentDate = addMonths(currentDate, 1); // Agregar 1 mes
    //         }
    //         else if (frequency === "Bimonthly")
    //         {
    //             currentDate = addMonths(currentDate, 2); // Agregar 2 meses
    //         }
    //         else if (frequency === "Quarterly")
    //         {
    //             currentDate = addMonths(currentDate, 3); // Agregar 3 meses
    //         }
    //         else if (frequency === "Semiannual")
    //         {
    //             currentDate = addMonths(currentDate, 6); // Agregar 6 meses
    //         }
    //     }

    //     return dates;
    // };

    const generateDates = (startDate: Date, frequency: FrequencyType): Array<AppointmentWithServices> =>
    {
        if (selectedServiceIds.length === 0)
        {
            toast.error("Debe seleccionar al menos un servicio");
            return [];
        }

        const dates: Array<AppointmentWithServices> = [];
        let currentDate = new Date(startDate);
        const currentYear = new Date().getFullYear();

        while (currentDate.getFullYear() <= currentYear)
        {
            dates.push({
                date: currentDate.toISOString(),
                services: [...selectedServiceIds], // Asociar los servicios seleccionados
            });

            if (frequency === "Fortnightly")
            {
                currentDate.setDate(currentDate.getDate() + 15);
            }
            else if (frequency === "Monthly")
            {
                currentDate = addMonths(currentDate, 1);
            }
            else if (frequency === "Bimonthly")
            {
                currentDate = addMonths(currentDate, 2);
            }
            else if (frequency === "Quarterly")
            {
                currentDate = addMonths(currentDate, 3);
            }
            else if (frequency === "Semiannual")
            {
                currentDate = addMonths(currentDate, 6);
            }
        }

        return dates;
    };

    const handleProgramService = () =>
    {
        if (!serviceDate)
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
        setValue("appointments", generatedDates);
        toast.success("Fechas generadas correctamente");
    };

    const handleAddDate = () =>
    {
        if (!newDate)
        {
            toast.error("Por favor seleccione una fecha para agregar");
            return;
        }

        const newDateISO = newDate.toISOString();

        // Verificar si la fecha ya existe
        const dateExists = appointments.some((dateISO: string) => format(new Date(dateISO), "yyyy-MM-dd") === format(newDate, "yyyy-MM-dd"));

        if (dateExists)
        {
            toast.error("Esta fecha ya está programada");
            return;
        }

        setValue("appointments", [...appointments, newDateISO]);
        setNewDate(undefined);
        toast.success("Fecha agregada correctamente");
    };

    const handleDeleteDate = (index: number) =>
    {
        const updatedDates = appointments.filter((_: string, i: number) => i !== index);
        setValue("appointments", updatedDates);
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

        const updatedDateISO = updatedDate.toISOString();

        // Verificar si la fecha ya existe (excepto la que estamos editando)
        const dateExists = appointments.some((dateISO: string, index: number) => index !== editingIndex &&
            format(new Date(dateISO), "yyyy-MM-dd") === format(updatedDate, "yyyy-MM-dd"));

        if (dateExists)
        {
            toast.error("Esta fecha ya está programada");
            return;
        }

        const updatedDates = [...appointments];
        updatedDates[editingIndex] = updatedDateISO;
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
        /* const initialDate = editingIndex !== null ? new Date(appointments[editingIndex]) : undefined;
        const [tempDate, setTempDate] = useState<Date | undefined>(initialDate); */
        const initialDate =
    editingIndex !== null && appointments[editingIndex] ? new Date(appointments[editingIndex].date) : undefined;
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
                        {services.map((service) => (
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
            /* return (
                <Drawer open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle>
                                Editar fecha
                            </DrawerTitle>
                        </DrawerHeader>
                        <div className="px-4 py-2">
                            <DatePicker
                                value={tempDate}
                                onChange={setTempDate}
                                placeholder="Seleccione nueva fecha"
                                className="w-full"
                            />
                        </div>
                        <DrawerFooter className="flex-row gap-3 pt-2">
                            <Button variant="outline" className="flex-1" onClick={() => setIsEditDialogOpen(false)} type="button">
                                Cancelar
                            </Button>
                            <Button
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                                onClick={() => handleSaveEdit(tempDate)}
                                type="button"
                            >
                                Guardar
                            </Button>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            ); */
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
        /* return (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            Editar fecha
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <DatePicker
                            value={tempDate}
                            onChange={setTempDate}
                            placeholder="Seleccione nueva fecha"
                            className="w-full"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} type="button">
                            Cancelar
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleSaveEdit(tempDate)} type="button">
                            Guardar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        ); */
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
                            {services.map((service) => (
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
                            <ScrollArea className={isMobile ? "h-[250px]" : "h-[300px]"}>
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
                                                                {formatDate(appointment.date)}
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

    /* return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-xl">
                    Cronograma
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <h4 className="text-sm font-medium">
                        Seleccionar servicios
                    </h4>
                    {services.map((service) => (
                        <div key={service.id} className="flex items-center">
                            <Checkbox
                                checked={selectedServiceIds.includes(service.id!)}
                                onCheckedChange={() => handleServiceSelection(service.id!)}
                            />
                            <span className="ml-2">
                                {service.name}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                        <div className="flex-1">
                            <Label htmlFor="service-date" className="block mb-2">
                                Fecha Inicial
                            </Label>
                            <DatePicker
                                value={serviceDate}
                                onChange={(date) => setValue("serviceDate", date)}
                                placeholder="Seleccione fecha"
                                className="w-full"
                            />
                        </div>
                        <div>
                            <Label htmlFor="frequency" className="block mb-2">
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
                            disabled={!serviceDate || !frequency}
                        >
                            Programar Servicio
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                        <div className="flex-1">
                            <Label htmlFor="add-date" className="block mb-2">
                                Agregar fecha
                            </Label>
                            <DatePicker value={newDate} onChange={setNewDate} placeholder="Seleccione fecha" className="w-full" />
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

                    <div>
                        <Label className="block mb-2">
                            Fechas programadas
                        </Label>
                        <Card className="border border-gray-200">
                            <ScrollArea className={isMobile ? "h-[200px]" : "h-[300px]"}>
                                <div className="p-2">
                                    {appointments.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-4">
                                            No hay fechas programadas
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {appointments
                                                .map((dateISO: string, index: number) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between p-2 border rounded-md"
                                                    >
                                                        <div className="flex items-center">
                                                            <CalendarIcon className="h-4 w-4 mr-2 text-blue-500" />
                                                            <span>
                                                                {formatDate(dateISO)}
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
    ); */
}

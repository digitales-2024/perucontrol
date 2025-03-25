"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Plus, Trash2, Edit } from "lucide-react";
import { format, addMonths } from "date-fns";
import { es } from "date-fns/locale";
import DatePicker from "@/components/ui/date-time-picker";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";

type FrequencyType = "Bimonthly" | "Quarterly" | "Semiannual"

interface ScheduledDate {
  id: string
  date: Date
  isEditing?: boolean
}

export function ServiceDates()
{
    const [serviceDate, setServiceDate] = useState<Date | undefined>(undefined);
    const [frequency, setFrequency] = useState<FrequencyType | "">("");
    const [scheduledDates, setScheduledDates] = useState<Array<ScheduledDate>>([]);
    const [newDate, setNewDate] = useState<Date | undefined>(undefined);
    const [editingDate, setEditingDate] = useState<ScheduledDate | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const isMobile = useIsMobile();

    // Función para generar fechas basadas en la frecuencia
    const generateDates = (startDate: Date, frequency: FrequencyType): Array<Date> =>
    {
        const dates: Array<Date> = [new Date(startDate)];
        let currentDate = new Date(startDate);
        const maxIterations = 12 / (frequency === "Bimonthly" ? 2 : frequency === "Quarterly" ? 3 : 6); // Calcula cuántas fechas deberían generarse en 12 meses.

        for (let i = 1; i < maxIterations; i += 1)
        {
            const monthsToAdd = frequency === "Bimonthly" ? 2 : frequency === "Quarterly" ? 3 : 6;
            currentDate = addMonths(currentDate, monthsToAdd);
            dates.push(new Date(currentDate));
        }

        return dates;
    };

    const handleAddDate = () =>
    {
        if (!newDate)
        {
            toast.error("Por favor seleccione una fecha para agregar");
            return;
        }

        // Verificar si la fecha ya existe
        const dateExists = scheduledDates.some((item) => format(item.date, "yyyy-MM-dd") === format(newDate, "yyyy-MM-dd"));

        if (dateExists)
        {
            toast.error("Esta fecha ya está programada");
            return;
        }

        setScheduledDates([...scheduledDates, { id: crypto.randomUUID(), date: newDate }]);
        setNewDate(undefined);
        toast.success("Fecha agregada correctamente");
    };

    const handleDeleteDate = (id: string) =>
    {
        setScheduledDates(scheduledDates.filter((date) => date.id !== id));
        toast.success("Fecha eliminada correctamente");
    };

    const handleEditDate = (scheduledDate: ScheduledDate) =>
    {
        setEditingDate(scheduledDate);
        setIsEditDialogOpen(true);
    };

    const handleSaveEdit = (newDate: Date | undefined) =>
    {
        if (!newDate || !editingDate) return;

        // Verificar si la nueva fecha ya existe en otras fechas programadas
        const dateExists = scheduledDates.some((item) => item.id !== editingDate.id && format(item.date, "yyyy-MM-dd") === format(newDate, "yyyy-MM-dd"));

        if (dateExists)
        {
            toast.error("Esta fecha ya está programada");
            return;
        }

        setScheduledDates(scheduledDates.map((date) => (date.id === editingDate.id ? { ...date, date: newDate } : date)));

        setIsEditDialogOpen(false);
        setEditingDate(null);
        toast.success("Fecha actualizada correctamente");
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

        // Generar fechas basadas en la frecuencia
        const generatedDates = generateDates(serviceDate, frequency as FrequencyType);

        // Convertir las fechas generadas a objetos ScheduledDate
        const newScheduledDates = generatedDates.map((date) => ({
            id: crypto.randomUUID(),
            date,
        }));

        // Actualizar el estado con las nuevas fechas
        setScheduledDates(newScheduledDates);
        toast.success("Fechas generadas correctamente");
    };

    const handleSaveService = () =>
    {
        if (scheduledDates.length === 0)
        {
            toast.error("Por favor configure al menos una fecha");
            return;
        }

        // Lógica para guardar el servicio
        console.log("Fechas programadas:", scheduledDates);
        toast.success("Servicio guardado correctamente");
    };

    const formatDate = (date: Date) => format(date, "d 'de' MMMM, yyyy", { locale: es });

    // Componente de edición de fecha (responsivo)
    const EditDateDialog = () =>
    {
        const [tempDate, setTempDate] = useState<Date | undefined>(editingDate ? new Date(editingDate.date) : undefined);

        if (isMobile)
        {
            return (
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
                            <Button variant="outline" className="flex-1" onClick={() => setIsEditDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => handleSaveEdit(tempDate)}>
                                Guardar
                            </Button>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            );
        }

        return (
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
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleSaveEdit(tempDate)}>
                            Guardar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-xl">
                    Configurar fecha
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                        <div className="flex-1">
                            <Label htmlFor="service-date" className="block mb-2">
                                Fecha de Servicio
                            </Label>
                            <DatePicker
                                value={serviceDate}
                                onChange={setServiceDate}
                                placeholder="Seleccione fecha"
                                className="w-full"
                            />
                        </div>
                        <div>
                            <Label htmlFor="frequency" className="block mb-2">
                                Frecuencia
                            </Label>
                            <Select value={frequency} onValueChange={(value) => setFrequency(value as FrequencyType)}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Frecuencia" />
                                </SelectTrigger>
                                <SelectContent>
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
                                    {scheduledDates.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-4">
                                            No hay fechas programadas
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {scheduledDates
                                                .sort((a, b) => a.date.getTime() - b.date.getTime())
                                                .map((scheduledDate) => (
                                                    <div
                                                        key={scheduledDate.id}
                                                        className="flex items-center justify-between p-2 border rounded-md"
                                                    >
                                                        <div className="flex items-center">
                                                            <CalendarIcon className="h-4 w-4 mr-2 text-blue-500" />
                                                            <span>
                                                                {formatDate(scheduledDate.date)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleEditDate(scheduledDate)}
                                                                className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDeleteDate(scheduledDate.id)}
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
            <CardFooter className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline">
                    Cancelar
                </Button>
                <Button
                    onClick={handleSaveService}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={scheduledDates.length === 0}
                >
                    Guardar Servicio
                </Button>
            </CardFooter>

            {/* Diálogo de edición de fecha */}
            <EditDateDialog />
        </Card>
    );
}

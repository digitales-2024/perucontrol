"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useFormContext } from "react-hook-form";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

type FrequencyType = "Bimonthly" | "Quarterly" | "Semiannual"

export function ServiceDates()
{
    const { setValue, watch } = useFormContext();
    const appointments = watch("appointments") ?? []; // Ahora será un array de strings ISO
    const serviceDate = watch("serviceDate");
    const frequency = watch("frequency");
    const [newDate, setNewDate] = useState<Date | undefined>(undefined);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const isMobile = useIsMobile();

    // Función para generar fechas basadas en la frecuencia
    const generateDates = (startDate: Date, frequency: FrequencyType): Array<string> =>
    {
        const dates: Array<string> = [startDate.toISOString()];
        let currentDate = new Date(startDate);
        const maxIterations = 12 / (frequency === "Bimonthly" ? 2 : frequency === "Quarterly" ? 3 : 6);

        for (let i = 1; i < maxIterations; i += 1)
        {
            const monthsToAdd = frequency === "Bimonthly" ? 2 : frequency === "Quarterly" ? 3 : 6;
            currentDate = addMonths(currentDate, monthsToAdd);
            dates.push(currentDate.toISOString());
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

    const formatDate = (dateISO: string) => format(new Date(dateISO), "d 'de' MMMM, yyyy", { locale: es });

    const EditDateDialog = () =>
    {
        const initialDate = editingIndex !== null ? new Date(appointments[editingIndex]) : undefined;
        const [tempDate, setTempDate] = useState<Date | undefined>(initialDate);

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
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} type="button">
              Cancelar
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleSaveEdit(tempDate)} type="button">
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
Configurar fechas
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
    );
}

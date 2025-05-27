import { Button } from "@/components/ui/button";
import DatePicker from "@/components/ui/date-time-picker";
import { useState } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface EditAppointmentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newDate: Date) => void;
    text: string,
    initialDate?: Date;
}

export function EditAppointmentDialog({ isOpen, onClose, onSave, initialDate, text }: EditAppointmentDialogProps)
{
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate);

    const handleSave = () =>
    {
        if (selectedDate)
        {
            onSave(selectedDate);
            onClose();
        }
        else
        {
            console.error("No se seleccionó una fecha");
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {text}
                    </AlertDialogTitle>
                </AlertDialogHeader>
                <div className="space-y-4">
                    <DatePicker
                        value={selectedDate}
                        onChange={setSelectedDate}
                        placeholder="Seleccione una nueva fecha"
                        className="w-full"
                    />
                </div>
                <AlertDialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={!selectedDate}>
                        Guardar
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

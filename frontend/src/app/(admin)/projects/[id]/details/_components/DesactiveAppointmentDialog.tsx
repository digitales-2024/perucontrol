import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface DesactiveAppointmentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void; // Acción a ejecutar al confirmar
}

export function DesactiveAppointmentDialog({ isOpen, onClose, onConfirm }: DesactiveAppointmentDialogProps)
{
    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        ¿Estás seguro de que deseas eliminar esta cita?
                    </AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button variant="destructive" onClick={onConfirm}>
                        Eliminar
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

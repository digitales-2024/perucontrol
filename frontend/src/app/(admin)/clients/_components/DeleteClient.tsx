import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Client } from "../types/clients";
import { RemoveClient } from "../actions";
import { toast } from "sonner";

interface DeleteClientProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client,
  showTrigger?: boolean;
}

export function DeleteClient({open, onOpenChange, client, showTrigger = true}: DeleteClientProps)
{

    const onDeleteClientsHandler = async() =>
    {
        try
        {
            const result = await RemoveClient(client.id);
            const error = result[1];
            if (error)
            {
                throw new Error(error.message);
            }
            toast.success("Cliente eliminado exitosamente!");
        }
        catch (error: unknown)
        {
            if (error instanceof Error)
            {
                toast.error(error.message || "Error al eliminar el cliente");
            }
            else
            {
                toast.error("Error al eliminar el cliente");
            }
        }
        finally
        {
            onOpenChange(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            { showTrigger ? (
                <AlertDialogTrigger asChild>
                    <Button variant="outline">
                    Eliminar
                    </Button>
                </AlertDialogTrigger>
            ) : null}
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        ¿Esta absolutamente seguro?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente los datos del cliente.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>
                        Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                        aria-label="Delete selected rows"
                        onClick={onDeleteClientsHandler}
                    >
                        Continuar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

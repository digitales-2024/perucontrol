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

interface DeleteClientProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client,
  showTrigger?: boolean;
}

export function DeleteClient({open, onOpenChange, client, showTrigger = true}: DeleteClientProps)
{

    const onDeleteClientsHandler = () =>
    {
        RemoveClient(client.id);
        onOpenChange(false);
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

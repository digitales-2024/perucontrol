import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerTrigger, DrawerDescription, DrawerClose } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { components } from "@/types/api";
import { toastWrapper } from "@/types/toasts";
import { RemoveClient } from "../actions";

interface DeleteClientProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: components["schemas"]["Client"];
  showTrigger?: boolean;
}

export function DeleteClient({ open, onOpenChange, client, showTrigger = true }: DeleteClientProps)
{
    const isMobile = useIsMobile();

    const onDeleteClientsHandler = async() =>
    {
        const [, err] = await toastWrapper(RemoveClient(client.id!), {
            loading: "Eliminando cliente...",
            success: "Cliente eliminado exitosamente!",
        });
        if (err !== null)
        {
            return;
        }
        onOpenChange(false);
    };

    return isMobile ? (
        <Drawer open={open} onOpenChange={onOpenChange}>
            {showTrigger ? (
                <DrawerTrigger asChild>
                    <Button variant="outline">
                        Eliminar
                    </Button>
                </DrawerTrigger>
            ) : null}
            <ScrollArea className="h-[10vh] px-4">
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>
                        ¿Esta absolutamente seguro?
                        </DrawerTitle>
                        <DrawerDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente los datos del cliente.
                        </DrawerDescription>
                    </DrawerHeader>
                    <DrawerFooter>
                        <DrawerClose className="border py-1 px-4 text-sm">
                            Cancelar
                        </DrawerClose>
                        <Button
                            aria-label="Delete selected rows"
                            onClick={onDeleteClientsHandler}
                        >
                            Continuar
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </ScrollArea>
        </Drawer>
    ) : (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            {showTrigger ? (
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

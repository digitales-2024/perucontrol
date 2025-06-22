import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerTrigger, DrawerDescription, DrawerClose } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { components } from "@/types/api";
import { toastWrapper } from "@/types/toasts";
import { ReactivateClient } from "../actions";

interface ReactiveClientProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    client: components["schemas"]["LegacyClient"];
    showTrigger?: boolean;
}

export function ReactiveClient({ open, onOpenChange, client, showTrigger = true }: ReactiveClientProps)
{
    const isMobile = useIsMobile();

    const onReactiveClientsHandler = async() =>
    {
        const [, err] = await toastWrapper(ReactivateClient(client.id!), {
            loading: "Reactivando cliente...",
            success: "Cliente reactivado exitosamente!",
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
                        Reactivar
                    </Button>
                </DrawerTrigger>
            ) : null}
            <ScrollArea className="h-[10vh] px-4">
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>
                            ¿Esta seguro?
                        </DrawerTitle>
                        <DrawerDescription>
                            Se habilitara el cliente y podrá ser utilizado en otros procesos.
                        </DrawerDescription>
                    </DrawerHeader>
                    <DrawerFooter>
                        <DrawerClose className="border py-1 px-4 text-sm">
                            Cancelar
                        </DrawerClose>
                        <Button
                            aria-label="Reactive selected rows"
                            onClick={onReactiveClientsHandler}
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
                        Reactivar
                    </Button>
                </AlertDialogTrigger>
            ) : null}
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        ¿Esta seguro?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Se habilitara el cliente y podrá ser utilizado en otros procesos.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>
                        Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                        aria-label="Reactive selected rows"
                        onClick={onReactiveClientsHandler}
                    >
                        Continuar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}


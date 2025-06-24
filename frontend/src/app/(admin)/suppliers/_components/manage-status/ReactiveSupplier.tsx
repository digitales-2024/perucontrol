import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerTrigger, DrawerDescription, DrawerClose } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toastWrapper } from "@/types/toasts";
import { ReactivateSupplier } from "../../_actions/SupplierActions";
import { Supplier } from "../../_types/Suppliers";
interface ReactiveSupplierDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    supplier: Supplier;
    showTrigger?: boolean;
}

export function ReactiveSupplierDialog({
    open,
    onOpenChange,
    supplier,
    showTrigger = true,
}: ReactiveSupplierDialogProps)
{
    const isMobile = useIsMobile();

    const onReactiveSuppliersHandler = async() =>
    {
        const [, err] = await toastWrapper(ReactivateSupplier(supplier.id!), {
            loading: "Reactivando proveedor...",
            success: "Proveedor reactivado exitosamente!",
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
                            Se habilitara el proveedor y podrá ser utilizado en
                            otros procesos.
                        </DrawerDescription>
                    </DrawerHeader>
                    <DrawerFooter>
                        <DrawerClose className="border py-1 px-4 text-sm">
                            Cancelar
                        </DrawerClose>
                        <Button
                            aria-label="Reactive selected rows"
                            onClick={onReactiveSuppliersHandler}
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
                        Se habilitara el proveedor y podrá ser utilizado en
                        otros procesos.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>
                        Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                        aria-label="Reactive selected rows"
                        onClick={onReactiveSuppliersHandler}
                    >
                        Continuar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}


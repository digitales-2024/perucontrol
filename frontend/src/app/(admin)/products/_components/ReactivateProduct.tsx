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
import { components } from "@/types/api";
import { toastWrapper } from "@/types/toasts";
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { ReactivatedProduct } from "../actions";

interface ReactivateProductProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: components["schemas"]["ProductDTO"],
  showTrigger?: boolean;
}

export function ReactivateProduct({ open, onOpenChange, product, showTrigger = true }: ReactivateProductProps)
{
    const isMobile = useIsMobile();

    const onDeleteQuotationHandler = async() =>
    {
        const [, err] = await toastWrapper(ReactivatedProduct(product.id!), {
            loading: "Reactivando cotización...",
            success: "Cotización reactivada exitosamente!",
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
                            Se habilitara el producto y podrá ser utilizado en otros procesos.
                        </DrawerDescription>
                    </DrawerHeader>
                    <DrawerFooter>
                        <DrawerClose className="border py-1 px-4 text-sm">
                            Cancelar
                        </DrawerClose>
                        <Button
                            aria-label="Delete selected rows"
                            onClick={onDeleteQuotationHandler}
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
                        Se habilitara el producto y podrá ser utilizado en otros procesos.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>
                        Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                        aria-label="Delete selected rows"
                        onClick={onDeleteQuotationHandler}
                    >
                        Continuar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

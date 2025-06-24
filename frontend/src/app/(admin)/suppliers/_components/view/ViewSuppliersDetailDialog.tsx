"use client";

import { Button } from "@/components/ui/button";
import { Eye, User } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { Supplier } from "../../_types/Suppliers";
import ViewSuppliersDetailContent from "./ViewSuppliersDetailContent";

interface ViewSupplierDetailsProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	supplier: Supplier;
	showTrigger?: boolean;
}

export function ViewSupplierDetails({
    open,
    onOpenChange,
    supplier,
    showTrigger = true,
}: ViewSupplierDetailsProps)
{
    const [isOpen, setIsOpen] = useState(open);
    const isMobile = useIsMobile();

    useEffect(() =>
    {
        setIsOpen(open);
    }, [open]);

    const handleOpenChange = (value: boolean) =>
    {
        setIsOpen(value);
        onOpenChange(value);
    };

    const triggerContent = (
        <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full hover:bg-blue-50 transition-colors duration-200"
            aria-label="Ver detalles del proveedor"
        >
            <Eye className="h-4 w-4 text-blue-500" />
        </Button>
    );

    if (!isMobile)
    {
        return (
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                {showTrigger && (
                    <DialogTrigger asChild>
                        {triggerContent}
                    </DialogTrigger>
                )}
                <DialogContent
                    tabIndex={undefined}
                    className="sm:max-w-[800px] sm:p-0 sm:pt-3"
                >
                    <div className="flex justify-between items-center pb-4 px-4 rounded-t-lg border-b">
                        <DialogTitle className="text-xl font-bold flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                <User className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <span className="text-blue-900">
                                    Detalles del Proveedor
                                </span>
                                <p className="text-sm font-normal text-blue-700 mt-1">
                                    Información completa
                                </p>
                            </div>
                        </DialogTitle>
                    </div>
                    <ScrollArea className="h-full max-h-[70vh] px-0">
                        <div className="px-6">
                            <ViewSuppliersDetailContent supplier={supplier} />
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={isOpen} onOpenChange={handleOpenChange}>
            {showTrigger && (
                <DrawerTrigger asChild>
                    {triggerContent}
                </DrawerTrigger>
            )}
            <DrawerContent className="h-[80vh]">
                <DrawerHeader className="text-left border-b">
                    <div className="flex justify-between items-center">
                        <DrawerTitle className="text-xl font-bold flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                <User className="h-6 w-6 text-blue-600" />
                            </div>
                            <span className="text-blue-900">
                                Detalles del Proveedor
                            </span>
                        </DrawerTitle>
                    </div>
                    <DrawerDescription className="text-blue-700">
                        Información completa del proveedor
                    </DrawerDescription>
                </DrawerHeader>
                <div className="flex-1 overflow-hidden pt-4">
                    <ScrollArea className="h-full px-0">
                        <div className="px-4">
                            <ViewSuppliersDetailContent supplier={supplier} />
                        </div>
                    </ScrollArea>
                </div>
            </DrawerContent>
        </Drawer>
    );
}

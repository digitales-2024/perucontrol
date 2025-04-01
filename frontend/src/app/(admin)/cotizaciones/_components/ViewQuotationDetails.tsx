"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { components } from "@/types/api";
import { Check, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";

interface ViewQuotationProps {
    quotation: components["schemas"]["Quotation3"] | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ViewQuotationDetails({ quotation, open, onOpenChange }: ViewQuotationProps)
{
    const [isOpen, setIsOpen] = useState(open);
    const isMobile = useIsMobile();

    // Sincronizar el estado interno con el prop open
    useEffect(() =>
    {
        setIsOpen(open);
    }, [open]);

    const handleOpenChange = (value: boolean) =>
    {
        setIsOpen(value);
        onOpenChange(value);
    };

    if (!quotation) return null;

    // Contenido común para ambas versiones
    const QuotationContent = () => (
        <div className="space-y-6">
            <div className="space-y-4">
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                        Cliente
                    </h3>
                    <p className="text-base">
                        {quotation.client?.name === "-" ? quotation.client.razonSocial : quotation.client?.name}
                    </p>
                </div>

                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                        Servicios
                    </h3>
                    {quotation.services?.map((service) => (
                        <p key={service.id} className="text-base mb-1">
                            {`- ${service.name}`}
                        </p>
                    ))}
                </div>

                <Separator />

                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                        Frecuencia
                    </h3>
                    <p className="text-base">
                        {quotation.frequency === "Bimonthly"
                            ? "Bimestral"
                            : quotation.frequency === "Quarterly"
                                ? "Trimestral"
                                : "Semestral"}
                    </p>
                </div>

                <div className={`grid ${isMobile ? "grid-cols-1 gap-3" : "grid-cols-3 gap-4"}`}>
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Área m2
                        </h3>
                        <p className="text-base">
                            {quotation.area}
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Nro. de Ambientes
                        </h3>
                        <p className="text-base">
                            {quotation.spacesCount}
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                            IGV
                        </h3>
                        <div className="flex items-center">
                            {quotation.hasTaxes ? (
                                <Check className="h-5 w-5 text-green-500 mr-1" />
                            ) : (
                                <X className="h-5 w-5 text-red-500 mr-1" />
                            )}
                            <span>
                                {quotation.hasTaxes ? "SI" : "NO"}
                            </span>
                        </div>
                    </div>
                </div>

                <Separator />

                <div className={`${isMobile ? "flex flex-col space-y-3" : "flex gap-12"}`}>
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Fecha de creación
                        </h3>
                        <p className="text-sm">
                            {new Intl.DateTimeFormat("es-ES", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                            }).format(new Date(quotation.creationDate))}
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Fecha de expiración
                        </h3>
                        <p className="text-sm">
                            {new Intl.DateTimeFormat("es-ES", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                            }).format(new Date(quotation.expirationDate))}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    // Versión móvil con Drawer
    if (isMobile)
    {
        return (
            <Drawer open={isOpen} onOpenChange={handleOpenChange}>
                <DrawerContent className="max-h-[90vh] overflow-hidden flex flex-col">
                    <DrawerHeader className="text-left">
                        <div className="flex justify-between items-center">
                            <DrawerTitle className="text-xl font-semibold">
                                Detalles de cotización
                            </DrawerTitle>
                        </div>
                        <DrawerDescription>
                            Información detallada de la cotización
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="px-4 pb-4 flex-1">
                        <ScrollArea className="h-[calc(100vh-360px)]">
                            <div className="pr-4">
                                <QuotationContent />
                            </div>
                        </ScrollArea>
                    </div>
                </DrawerContent>
            </Drawer>
        );
    }

    // Versión de escritorio con Dialog
    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md md:max-w-lg">
                <DialogHeader>
                    <div className="flex justify-between items-center">
                        <DialogTitle className="text-xl font-semibold">
                            Detalles de cotización
                        </DialogTitle>
                    </div>
                    <DialogDescription>
                        Información detallada de la cotización
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[70vh]">
                    <div className="pr-4">
                        <QuotationContent />
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}

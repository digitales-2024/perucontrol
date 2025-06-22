"use client";

import { Button } from "@/components/ui/button";
import { Eye, User, Briefcase, MapPin, Mail, Building } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { components } from "@/types/api";
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
import { cn } from "@/lib/utils";

interface ViewClientDetailsProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    client: components["schemas"]["LegacyClient"]
    showTrigger?: boolean
}

export function ViewClientDetails({ open, onOpenChange, client, showTrigger = true }: ViewClientDetailsProps)
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

    // Contenido del trigger común para ambas versiones
    const triggerContent = (
        <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full hover:bg-blue-50"
            aria-label="Ver detalles del cliente"
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
                <DialogContent className={cn("sm:max-w-[650px] md:max-w-[750px] p-0")}>
                    <div className="p-1 sm:p-2">
                        <div className="flex justify-between items-center mb-4">
                            <DialogTitle className="text-xl font-bold flex items-center">
                                <User className="h-6 w-6 mr-2 text-blue-500" />
                                Detalles del Cliente
                            </DialogTitle>
                        </div>
                        <ScrollArea className="max-h-[calc(100vh-200px)] pr-4">
                            <ClientDetailsDesktop client={client} />
                        </ScrollArea>
                    </div>
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
            <DrawerContent className="max-h-[90vh] overflow-hidden flex flex-col">
                <DrawerHeader className="text-left">
                    <div className="flex justify-between items-center">
                        <DrawerTitle className="text-xl font-bold flex items-center">
                            <User className="h-6 w-6 mr-2 text-blue-500" />
                            Detalles del Cliente
                        </DrawerTitle>
                    </div>
                    <DrawerDescription>
                        Información completa del cliente
                    </DrawerDescription>
                </DrawerHeader>
                <div className="px-4 pb-4 flex-1">
                    <ScrollArea className="h-[calc(100vh-330px)]">
                        <ClientDetailsMobile client={client} />
                    </ScrollArea>
                </div>
            </DrawerContent>
        </Drawer>
    );
}

// Versión optimizada para escritorio con layout de dos columnas
function ClientDetailsDesktop({ client }: { client: components["schemas"]["LegacyClient"] })
{
    return (
        <div className="space-y-6">
            <div>
                {client.name !== "-" && (
                    <h2 className="text-lg font-bold">
                        {client.name}
                    </h2>
                )}
                {client.contactName !== "" && (
                    <h3 className="text-base font-semibold">
                        {client.contactName}
                    </h3>
                )}
                {client.razonSocial !== "" && (
                    <p className="text-sm text-gray-500">
                        {client.razonSocial}
                    </p>
                )}
            </div>

            <Separator />

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-semibold mb-3 flex items-center">
                            <Briefcase className="mr-2 h-4 w-4 text-blue-500" />
                            Información de Documento
                        </h3>
                        <div className="space-y-3 pl-6">
                            <div>
                                <p className="text-xs text-gray-500">
                                    Tipo de Documento
                                </p>
                                <p className="text-sm font-medium">
                                    {client.typeDocument.toUpperCase()}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">
                                    Número de Documento
                                </p>
                                <p className="text-sm font-medium">
                                    {client.typeDocumentValue}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-semibold mb-3 flex items-center">
                            <Building className="mr-2 h-4 w-4 text-blue-500" />
                            Información de Negocio
                        </h3>
                        <div className="space-y-3 pl-6">
                            <div>
                                <p className="text-xs text-gray-500">
                                    Giro del Negocio
                                </p>
                                <p className="text-sm font-medium">
                                    {client.businessType}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-semibold mb-3 flex items-center">
                            <MapPin className="mr-2 h-4 w-4 text-blue-500" />
                            Direcciones
                        </h3>
                        <div className="space-y-3 pl-6">
                            <div>
                                <p className="text-xs text-gray-500">
                                    Fiscal
                                </p>
                                <p className="text-sm font-medium">
                                    {client.fiscalAddress}
                                </p>
                            </div>
                            {client.clientLocations.map((location, index) => (
                                <div key={index}>
                                    <p className="text-xs text-gray-500">
                                        Adicional
                                        {index + 1}
                                    </p>
                                    <p className="text-sm font-medium">
                                        {location.address}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-semibold mb-3 flex items-center">
                            <Mail className="mr-2 h-4 w-4 text-blue-500" />
                            Contacto
                        </h3>
                        <div className="space-y-3 pl-6">
                            <div>
                                <p className="text-xs text-gray-500">
                                    Correo Electrónico
                                </p>
                                <p className="text-sm font-medium">
                                    {client.email || "-"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">
                                    Teléfono
                                </p>
                                <p className="text-sm font-medium">
                                    {client.phoneNumber || "-"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Versión optimizada para móvil con layout de una columna
function ClientDetailsMobile({ client }: { client: components["schemas"]["LegacyClient"] })
{
    return (
        <div className="space-y-5 pr-4">
            <div>
                {client.name !== "-" && (
                    <h2 className="text-lg font-bold">
                        {client.name}
                    </h2>
                )}
                {client.contactName !== "" && (
                    <h3 className="text-base font-semibold">
                        {client.contactName}
                    </h3>
                )}
                {client.razonSocial !== "" && (
                    <p className="text-sm text-gray-500">
                        {client.razonSocial}
                    </p>
                )}
            </div>

            <Separator />

            <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                    <h3 className="text-sm font-semibold mb-2 flex items-center">
                        <Briefcase className="mr-2 h-4 w-4 text-blue-500" />
                        Información de Documento
                    </h3>
                    <div className="space-y-2 pl-6">
                        <div>
                            <p className="text-xs text-gray-500">
                                Tipo de Documento
                            </p>
                            <p className="text-sm font-medium">
                                {client.typeDocument.toUpperCase()}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">
                                Número de Documento
                            </p>
                            <p className="text-sm font-medium">
                                {client.typeDocumentValue}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                    <h3 className="text-sm font-semibold mb-2 flex items-center">
                        <Building className="mr-2 h-4 w-4 text-blue-500" />
                        Información de Negocio
                    </h3>
                    <div className="pl-6">
                        <p className="text-xs text-gray-500">
                            Giro del Negocio
                        </p>
                        <p className="text-sm font-medium">
                            {client.businessType}
                        </p>
                    </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                    <h3 className="text-sm font-semibold mb-2 flex items-center">
                        <MapPin className="mr-2 h-4 w-4 text-blue-500" />
                        Direcciones
                    </h3>
                    <div className="space-y-2 pl-6">
                        <div>
                            <p className="text-xs text-gray-500">
                                Fiscal
                            </p>
                            <p className="text-sm font-medium">
                                {client.fiscalAddress}
                            </p>
                        </div>
                        {client.clientLocations.map((location, index) => (
                            <div key={index}>
                                <p className="text-xs text-gray-500">
                                    Adicional
                                    {index + 1}
                                </p>
                                <p className="text-sm font-medium">
                                    {location.address}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                    <h3 className="text-sm font-semibold mb-2 flex items-center">
                        <Mail className="mr-2 h-4 w-4 text-blue-500" />
                        Contacto
                    </h3>
                    <div className="space-y-2 pl-6">
                        <div>
                            <p className="text-xs text-gray-500">
                                Correo Electrónico
                            </p>
                            <p className="text-sm font-medium">
                                {client.email || "-"}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">
                                Teléfono
                            </p>
                            <p className="text-sm font-medium">
                                {client.phoneNumber || "-"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


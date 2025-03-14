"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { components } from "@/types/api";
import { Check, X } from "lucide-react";

interface ViewQuotationProps {
  quotation: components["schemas"]["Quotation2"] | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewQuotationDetails({
    quotation,
    open,
    onOpenChange,
}: ViewQuotationProps)
{
    if (!quotation) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                    <div className="space-y-6 py-4">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">
                                  Cliente
                                </h3>
                                <p className="text-base">
                                    {quotation.client?.name === "-" ? quotation.client.razonSocial : quotation.client?.name }
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
                                  Descripción
                                </h3>
                                <p className="text-base">
                                    {quotation.description || "Sin descripción"}
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
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

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">
                                  Términos y Condiciones
                                </h3>
                                <div className="mt-2 p-3 border rounded-md bg-muted/20 text-sm">
                                    {quotation.termsAndConditions || "Sin términos y condiciones"}
                                </div>
                            </div>

                            {quotation.createdAt && (
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">
                                      Fecha de creación
                                    </h3>
                                    <p className="text-sm">
                                        {new Date(quotation.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                              Cerrar
                            </Button>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}

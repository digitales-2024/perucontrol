import type React from "react";
import { Button } from "@/components/ui/button";
import { Eye, User, Briefcase, MapPin, Mail, Phone, Building } from "lucide-react";
import type { Client } from "../types/clients";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface ViewClientDetailsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: Client
  showTrigger?: boolean
}

export function ViewClientDetails({ open, onOpenChange, client, showTrigger = true }: ViewClientDetailsProps)
{
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {showTrigger && (
                <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[500px] p-0">
                <Card className="border-0">
                    <CardHeader className="pb-4">
                        <DialogTitle className="text-xl font-bold flex items-center">
                            <User className="h-6 w-6 mr-2 text-blue-500" />
                            Detalles del Cliente
                        </DialogTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <ScrollArea className="max-h-[85vh] pr-4">
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-semibold">
                                        {client.name}
                                    </h2>
                                    {client.razonSocial !== "-" && (
                                        <p className="text-sm text-gray-500">
                                            {client.razonSocial}
                                        </p>
                                    )
                                    }
                                </div>

                                <Separator />

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <DetailItem icon={Briefcase} label="Tipo de Documento" value={client.typeDocument.toUpperCase()} />
                                    <DetailItem icon={Briefcase} label="Número de Documento" value={client.typeDocumentValue} />
                                </div>

                                <DetailItem icon={Building} label="Giro del Negocio" value={client.businessType} />

                                <div>
                                    <h3 className="text-sm font-semibold mb-2 flex items-center">
                                        <MapPin className="mr-2 h-4 w-4 text-blue-500" />
                                        Direcciones
                                    </h3>
                                    <div className="space-y-2 pl-6">
                                        <p className="text-sm">
                                            <strong>
                                                Fiscal:
                                            </strong>
                                            {" "}
                                            {client.fiscalAddress}
                                        </p>
                                        {client.clientLocations.map((location, index) => (
                                            <p key={index} className="text-sm">
                                                <strong>
                                                    Adicional
                                                    {index + 1}
                                                    :
                                                </strong>
                                                {" "}
                                                {location.address}
                                            </p>
                                        ))}
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <DetailItem icon={Mail} label="Correo Electrónico" value={client.email} />
                                    <DetailItem icon={Phone} label="Teléfono" value={client.phoneNumber} />
                                </div>
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog>
    );
}

const DetailItem: React.FC<{ icon: React.ElementType; label: string; value: string }> = ({
    icon: Icon,
    label,
    value,
}) => (
    <div className="flex flex-col">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Icon className="h-4 w-4 text-blue-500" />
            <span>
                {label}
            </span>
        </div>
        <p className="text-sm font-medium pl-6">
            {value}
        </p>
    </div>
);

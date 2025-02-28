// import type React from "react";
// import { Button } from "@/components/ui/button";
// import { Eye } from "lucide-react";
// import { Client } from "../types/clients";
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// interface ViewClientDetailsProps {
//   open: boolean,
//   onOpenChange: (open: boolean) => void,
//   client: Client
//   showTrigger?: boolean
// }

// export function ViewClientDetails({ open, onOpenChange, client, showTrigger = true}: ViewClientDetailsProps)
// {
//     return (
//         <Dialog open={open} onOpenChange={onOpenChange}>
//             {showTrigger && (
//                 <DialogTrigger asChild>
//                     <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
//                         <Eye className="h-4 w-4" />
//                     </Button>
//                 </DialogTrigger>
//             )}
//             <DialogContent className="sm:max-w-[425px]">
//                 <DialogHeader>
//                     <DialogTitle>
// Detalles del Cliente
//                     </DialogTitle>
//                     <DialogDescription>
// Información completa del cliente seleccionado.
//                     </DialogDescription>
//                 </DialogHeader>
//                 <div className="grid gap-4 py-4">
//                     <DetailItem label="Tipo de Documento" value={client.typeDocument.toUpperCase()} />
//                     <DetailItem label="Número de Documento" value={client.typeDocumentValue} />
//                     {client.razonSocial && <DetailItem label="Razón Social" value={client.razonSocial} />}
//                     <DetailItem label="Nombre" value={client.name} />
//                     <DetailItem label="Giro del Negocio" value={client.businessType} />
//                     <DetailItem label="Dirección Fiscal" value={client.fiscalAddress} />
//                     <DetailItem label="Correo Electrónico" value={client.email} />
//                     <DetailItem label="Teléfono" value={client.phoneNumber} />
//                     <div className="space-y-2">
//                         <h3 className="font-semibold">
// Direcciones Adicionales:
//                         </h3>
//                         {client.clientLocations.map((location, index) => (
//                             <p key={index} className="text-sm">
//                                 {location.address}
//                             </p>
//                         ))}
//                     </div>
//                 </div>
//             </DialogContent>
//         </Dialog>
//     );
// }

// const DetailItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
//     <div className="grid grid-cols-4 items-center gap-4">
//         <span className="text-sm font-medium">
//             {label}
// :
//         </span>
//         <span className="text-sm col-span-3">
//             {value}
//         </span>
//     </div>
// );

import type React from "react";
import { Button } from "@/components/ui/button";
import { Eye, User, Briefcase, MapPin, Mail, Phone, Building } from "lucide-react";
import type { Client } from "../types/clients";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

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
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
Detalles del Cliente
                    </DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[80vh] pr-4">
                    <div className="grid gap-6">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center space-x-4">
                                    <User className="h-12 w-12 text-blue-500" />
                                    <div>
                                        <h2 className="text-xl font-semibold">
                                            {client.name}
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            {client.razonSocial || "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <DetailItem icon={Briefcase} label="Tipo de Documento" value={client.typeDocument.toUpperCase()} />
                            <DetailItem icon={Briefcase} label="Número de Documento" value={client.typeDocumentValue} />
                        </div>

                        <DetailItem icon={Building} label="Giro del Negocio" value={client.businessType} />

                        <Card>
                            <CardContent className="pt-6">
                                <h3 className="text-lg font-semibold mb-2 flex items-center">
                                    <MapPin className="mr-2 h-5 w-5 text-blue-500" />
                  Direcciones
                                </h3>
                                <div className="space-y-2">
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
                            </CardContent>
                        </Card>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <DetailItem icon={Mail} label="Correo Electrónico" value={client.email} />
                            <DetailItem icon={Phone} label="Teléfono" value={client.phoneNumber} />
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}

const DetailItem: React.FC<{ icon: React.ElementType; label: string; value: string }> = ({
    icon: Icon,
    label,
    value,
}) => (
    <Card>
        <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
                <Icon className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium">
                    {label}
                </span>
            </div>
            <p className="mt-1 text-lg">
                {value}
            </p>
        </CardContent>
    </Card>
);


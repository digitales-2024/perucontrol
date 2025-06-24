
import {

    User,
    Briefcase,
    MapPin,
    Mail,
    Building,
    Phone,
    FileText,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Supplier } from "../../_types/Suppliers";

interface ViewSuppliersDetailContentProps {
    supplier: Supplier;
}

export default function ViewSuppliersDetailContent({supplier}: ViewSuppliersDetailContentProps)
{
    return (
        <div className="space-y-6 pb-4">
            {/* Header del Proveedor */}
            <Card className="border-l-4 border-l-blue-500 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            {supplier.name !== "-" && (
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <Building className="h-5 w-5 text-blue-600" />
                                    {supplier.name}
                                </h2>
                            )}
                            {supplier.contactName !== "" && (
                                <h3 className="text-base font-semibold flex items-center gap-2 text-gray-700">
                                    <User className="h-4 w-4" />
                                    {supplier.contactName}
                                </h3>
                            )}
                            {supplier.businessName !== "" && (
                                <p className="text-sm text-gray-500 ml-6">
                                    {supplier.businessName}
                                </p>
                            )}
                        </div>
                        <Badge
                            variant="secondary"
                            className={
                                supplier.isActive
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-red-100 text-red-800"
                            }
                        >
                            {supplier.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Información de RUC y Negocio */}
                <div className="space-y-4">
                    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <div className="p-1.5 bg-green-100 rounded-md">
                                    <FileText className="h-4 w-4 text-green-600" />
                                </div>
                                Información de RUC
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                                            RUC
                                        </p>
                                        <p className="text-sm font-medium font-mono">
                                            {supplier.rucNumber}
                                        </p>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className="text-xs"
                                    >
                                        11 dígitos
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <div className="p-1.5 bg-purple-100 rounded-md">
                                    <Briefcase className="h-4 w-4 text-purple-600" />
                                </div>
                                Información de Negocio
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500 uppercase tracking-wide">
                                    Giro del Negocio
                                </p>
                                <p className="text-sm font-medium">
                                    {supplier.businessType}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Direcciones y Contacto */}
                <div className="space-y-4">
                    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <div className="p-1.5 bg-orange-100 rounded-md">
                                    <MapPin className="h-4 w-4 text-orange-600" />
                                </div>
                                Direcciones

                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-3">
                            <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-l-blue-400">
                                <p className="text-xs text-blue-600 uppercase tracking-wide font-medium">
                                    Fiscal
                                </p>
                                <p className="text-sm font-medium flex-wrap text-gray-800">
                                    {supplier.fiscalAddress}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <div className="p-1.5 bg-teal-100 rounded-md">
                                    <Mail className="h-4 w-4 text-teal-600" />
                                </div>
                                Información de Contacto
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-3">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <Mail className="h-3 w-3 text-gray-400" />
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                                        Correo Electrónico
                                    </p>
                                </div>
                                <p className="text-sm font-medium">
                                    {supplier.email || "-"}
                                </p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <Phone className="h-3 w-3 text-gray-400" />
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                                        Teléfono
                                    </p>
                                </div>
                                <p className="text-sm font-medium">
                                    {supplier.phoneNumber || "-"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

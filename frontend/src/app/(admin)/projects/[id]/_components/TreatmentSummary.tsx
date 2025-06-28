"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Package, MapPin, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { components } from "@/types/api";

interface TreatmentSummaryProps {
    appointmentId: string;
    treatmentAreas: Array<components["schemas"]["TreatmentAreaDTO"]>;
    treatmentProducts: Array<components["schemas"]["TreatmentProductDTO"]>;
}

export function TreatmentSummary({ appointmentId, treatmentAreas, treatmentProducts }: TreatmentSummaryProps)
{
    const router = useRouter();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tarjeta de Productos */}
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 border-b">
                    <div className="flex flex-wrap justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <Package className="h-6 w-6 text-blue-600" />
                            </div>
                            <CardTitle className="text-lg font-semibold">
                                Productos de Tratamiento
                            </CardTitle>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/projects/${appointmentId}/evento/${appointmentId}/products`)}
                            className="text-blue-600 hover:bg-blue-50/50 group"
                        >
                            <Edit className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
                            Editar
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    {treatmentProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-center">
                            <Plus className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">
                                No hay productos registrados
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {treatmentProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="p-4 bg-white rounded-lg border shadow-sm"
                                >
                                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-gray-500">
                                                Concentración:
                                            </span>
                                            <span className="font-medium text-gray-700">
                                                {product.amountAndSolvent}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-gray-500">
                                                Equipo:
                                            </span>
                                            <span className="font-medium text-gray-700">
                                                {product.equipmentUsed}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-gray-500">
                                                Técnica:
                                            </span>
                                            <Badge variant="outline" className="px-2 py-0.5">
                                                {product.appliedTechnique}
                                            </Badge>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-gray-500">
                                                Servicio:
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className="bg-green-50 border-green-200 text-green-700 px-2 py-0.5"
                                            >
                                                {product.appliedService}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Tarjeta de Áreas */}
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 border-b">
                    <div className="flex flex-wrap justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-lg">
                                <MapPin className="h-6 w-6 text-green-600" />
                            </div>
                            <CardTitle className="text-lg font-semibold">
                                Áreas de Tratamiento
                            </CardTitle>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/projects/${appointmentId}/evento/${appointmentId}/treatment-areas`)}
                            className="text-green-600 hover:bg-green-50/50 group"
                        >
                            <Edit className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
                            Editar
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    {treatmentAreas.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-center">
                            <Plus className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">
                                No hay áreas registradas
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {treatmentAreas.map((area) => (
                                <div
                                    key={area.id}
                                    className="p-3 bg-gray-50/50 rounded-lg border transition-colors hover:bg-gray-100/50"
                                >
                                    <h4 className="font-medium text-sm flex items-center gap-2 text-gray-800">
                                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                                        {area.areaName}
                                    </h4>
                                    <div className="mt-2 flex flex-col gap-1.5 text-xs text-gray-600">
                                        {area.observedVector && (
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">
                                                    Vector:
                                                </span>
                                                <Badge variant="outline" className="px-2 py-0.5">
                                                    {area.observedVector}
                                                </Badge>
                                            </div>
                                        )}
                                        {area.infestationLevel && (
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">
                                                    Nivel:
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "px-2 py-0.5",
                                                        area.infestationLevel === "Alto" ? "bg-red-50 border-red-200 text-red-700"
                                                            : area.infestationLevel === "Medio" ? "bg-amber-50 border-amber-200 text-amber-700"
                                                                : "bg-green-50 border-green-200 text-green-700",
                                                    )}
                                                >
                                                    {area.infestationLevel}
                                                </Badge>
                                            </div>
                                        )}
                                        {area.appliedTechnique && (
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">
                                                    Técnica:
                                                </span>
                                                <Badge variant="outline" className="px-2 py-0.5">
                                                    {area.appliedTechnique}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function cn(...classes: Array<string>)
{
    return classes.filter(Boolean).join(" ");
}

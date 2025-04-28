import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ListChecks, CheckCircle2 } from "lucide-react";
import { components } from "@/types/api";

interface ServiceSelectorProps {
  availableServices: Array<components["schemas"]["Service"]>;
  selectedServiceIds: Array<string>;
  onServiceSelection: (serviceId: string) => void;
  getServiceName: (serviceId: string) => string;
}

// ServiceBadges component to show selected services
const ServiceBadges = React.memo(({ serviceIds, getServiceName }: {
  serviceIds: Array<string>;
  getServiceName: (id: string) => string;
}) => (
    <div className="flex flex-wrap gap-1 mt-1">
        {serviceIds.map((serviceId) => (
            <Badge key={serviceId} variant="outline" className="text-xs bg-blue-50">
                {getServiceName(serviceId)}
            </Badge>
        ))}
    </div>
));

ServiceBadges.displayName = "ServiceBadges";

export const ServiceSelector = React.memo(({
    availableServices,
    selectedServiceIds,
    onServiceSelection,
    getServiceName,
}: ServiceSelectorProps) => (
    <Card className="border border-blue-100 bg-blue-50/30">
        <CardHeader className="py-3">
            <CardTitle className="text-md font-medium flex items-center">
                <ListChecks className="h-4 w-4 mr-2 text-blue-500" />
                Seleccionar Servicios
            </CardTitle>
        </CardHeader>
        <Separator className="bg-blue-100" />
        <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {availableServices.map((service) => (
                    <div
                        key={service.id}
                        className="flex items-center space-x-2 p-2 rounded-md border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-colors"
                    >
                        <Checkbox
                            id={`service-${service.id}`}
                            checked={selectedServiceIds.includes(service.id!)}
                            onCheckedChange={() => onServiceSelection(service.id!)}
                            className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                        />
                        <Label
                            htmlFor={`service-${service.id}`}
                            className="text-sm cursor-pointer flex-1 truncate"
                        >
                            {service.name}
                        </Label>
                    </div>
                ))}
            </div>
            {selectedServiceIds.length > 0 && (
                <div className="mt-4 p-2 bg-blue-50 rounded-md border border-blue-100">
                    <div className="flex items-center text-sm text-blue-700 mb-1">
                        <CheckCircle2 className="h-4 w-4 mr-1 text-blue-500" />
                        <span>
                            Servicios seleccionados:
                        </span>
                    </div>
                    <ServiceBadges serviceIds={selectedServiceIds} getServiceName={getServiceName} />
                </div>
            )}
        </CardContent>
    </Card>
));

ServiceSelector.displayName = "ServiceSelector";

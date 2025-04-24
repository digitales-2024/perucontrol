import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import DatePicker from "@/components/ui/date-time-picker";
import { components } from "@/types/api";

interface EditDateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: Date;
  selectedServiceIds: Array<string>;
  onServiceSelection: (serviceId: string) => void;
  onSave: (date: Date | undefined) => void;
  onCancel: () => void;
  services: Array<components["schemas"]["Service"]>;
  isMobile: boolean;
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

export const EditDateDialog = React.memo(({
    isOpen,
    onOpenChange,
    initialDate,
    selectedServiceIds,
    onServiceSelection,
    onSave,
    onCancel,
    services,
    isMobile,
    getServiceName,
}: EditDateDialogProps) =>
{
    const [tempDate, setTempDate] = useState<Date | undefined>(initialDate);

    // Reset tempDate when initialDate changes
    React.useEffect(() =>
    {
        setTempDate(initialDate);
    }, [initialDate]);

    const dialogContent = (
        <>
            <div className="py-4">
                <Label className="block mb-2 font-medium">
                    Fecha
                </Label>
                <DatePicker
                    value={tempDate}
                    onChange={setTempDate}
                    placeholder="Seleccione nueva fecha"
                    className="w-full"
                />
            </div>

            <div className="py-2">
                <Label className="block mb-2 font-medium">
                    Servicios a realizar
                </Label>
                <div className="space-y-2 max-h-60 overflow-y-auto p-3 border rounded-md bg-gray-50">
                    {services.map((service) => (
                        <div key={service.id} className="flex items-center space-x-2 p-1.5 hover:bg-gray-100 rounded-md">
                            <Checkbox
                                id={`edit-service-${service.id}`}
                                checked={selectedServiceIds.includes(service.id!)}
                                onCheckedChange={() => onServiceSelection(service.id!)}
                                className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                            />
                            <Label
                                htmlFor={`edit-service-${service.id}`}
                                className="text-sm cursor-pointer"
                            >
                                {service.name}
                            </Label>
                        </div>
                    ))}
                </div>
                {selectedServiceIds.length > 0 && (
                    <div className="mt-2">
                        <Label className="text-xs text-muted-foreground">
                            Servicios seleccionados:
                        </Label>
                        <ServiceBadges serviceIds={selectedServiceIds} getServiceName={getServiceName} />
                    </div>
                )}
            </div>
        </>
    );

    if (isMobile)
    {
        return (
            <Drawer open={isOpen} onOpenChange={onOpenChange}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>
                            Editar fecha y servicios
                        </DrawerTitle>
                    </DrawerHeader>
                    <div className="px-4">
                        {dialogContent}
                    </div>
                    <DrawerFooter className="flex-row gap-3 pt-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={onCancel}
                            type="button"
                        >
                            Cancelar
                        </Button>
                        <Button
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            onClick={() => onSave(tempDate)}
                            type="button"
                            disabled={!tempDate || selectedServiceIds.length === 0}
                        >
                            Guardar
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        Editar fecha y servicios
                    </DialogTitle>
                </DialogHeader>
                {dialogContent}
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        type="button"
                    >
                        Cancelar
                    </Button>
                    <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => onSave(tempDate)}
                        type="button"
                        disabled={!tempDate || selectedServiceIds.length === 0}
                    >
                        Guardar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
});

EditDateDialog.displayName = "EditDateDialog";

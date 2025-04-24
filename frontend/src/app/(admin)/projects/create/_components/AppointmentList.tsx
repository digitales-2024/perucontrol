import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, CalendarIcon, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type AppointmentWithServices = {
  dueDate: string;
  services: Array<string>;
};

interface AppointmentListProps {
  appointments: Array<AppointmentWithServices>;
  onEditDate: (index: number) => void;
  onDeleteDate: (index: number) => void;
  getServiceName: (serviceId: string) => string;
  isMobile: boolean;
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

const formatDate = (dateISO: string) => format(new Date(dateISO), "d 'de' MMMM, yyyy", { locale: es });

export const AppointmentList = React.memo(({
    appointments,
    onEditDate,
    onDeleteDate,
    getServiceName,
    isMobile,
}: AppointmentListProps) => (
    <div>
        <Label className="block mb-2 font-medium">
            Fechas programadas
        </Label>
        <Card className="border border-gray-200">
            <ScrollArea className={isMobile ? "h-[15rem]" : "h-[40rem]"}>
                <div className="p-2">
                    {appointments.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                            No hay fechas programadas
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {appointments.map((appointment: AppointmentWithServices, index: number) => (
                                <div
                                    key={index}
                                    className="flex flex-col p-3 border rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <CalendarIcon className="h-4 w-4 mr-2 text-blue-500" />
                                            <span className="font-medium">
                                                {formatDate(appointment.dueDate)}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                type="button"
                                                onClick={() => onEditDate(index)}
                                                className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                type="button"
                                                onClick={() => onDeleteDate(index)}
                                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {appointment.services && appointment.services.length > 0 && (
                                        <div className="mt-2 pl-6">
                                            <div className="flex items-center text-xs text-muted-foreground mb-1">
                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                <span>
                                                    Servicios programados:
                                                </span>
                                            </div>
                                            <ServiceBadges serviceIds={appointment.services} getServiceName={getServiceName} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </ScrollArea>
        </Card>
    </div>
));

AppointmentList.displayName = "AppointmentList";

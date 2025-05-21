"use client";

import { useForm, FormProvider } from "react-hook-form";
import { ClientData } from "./ClientData";
import { ServiceDates } from "./ServiceDates";
import { Button } from "@/components/ui/button";
import type { components } from "@/types/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { type ClientDataSchema, clientDataSchema } from "../../schemas";
import { toastWrapper } from "@/types/toasts";
import { CreateProject } from "../../actions";
import { useState } from "react";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ProjectFormProps {
    clients: Array<components["schemas"]["Client"]>;
    services: Array<components["schemas"]["Service"]>;
    quotations: Array<components["schemas"]["Quotation2"]>;
}

export function ProjectForm({ clients, services, quotations }: ProjectFormProps)
{
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedServices, setSelectedServices] = useState<Array<string>>([]);
    const r = useRouter();

    // Configuración del formulario con validación estricta
    const formMethods = useForm<ClientDataSchema>({
        resolver: zodResolver(clientDataSchema),
        defaultValues: {
            clientId: "",
            quotationId: null,
            address: "",
            frequency: "Bimonthly",
            area: 1,
            spacesCount: 1,
            price: 0,
            ambients: [],
            services: [],
            appointments: [],
        },
    });

    const {
        handleSubmit,
        formState: { /* errors */ },
    } = formMethods;

    const onSubmit = async(data: ClientDataSchema) =>
    {
        // Validar que haya al menos un ambiente
        if (data.ambients.length === 0)
        {
            toast.error("Debe agregar al menos un ambiente.");
            return; // Detener el envío del formulario
        }

        try
        {
            setIsSubmitting(true);

            // Transformar las citas para asegurarse de que dueDate sea una cadena en formato ISO
            const transformedAppointments = data.appointments.map((appointment) => ({
                ...appointment,
                dueDate: new Date(appointment.dueDate).toISOString(), // Convertir a formato ISO
            }));

            // Validación adicional para asegurar el formato correcto
            const isValidAppointments = transformedAppointments.every((appointment) =>
            {
                try
                {
                    return (
                        !isNaN(new Date(appointment.dueDate).getTime()) &&
                        appointment.services.length > 0
                    );
                }
                catch
                {
                    return false;
                }
            });

            if (!isValidAppointments)
            {
                toast.error("Alguna fecha programada no tiene un formato válido");
                return;
            }

            // Estructura exacta que espera el endpoint
            const requestData: components["schemas"]["ProjectCreateDTO"] = {
                clientId: data.clientId,
                quotationId: data.quotationId,
                services: data.services,
                address: data.address,
                area: data.area,
                companyRepresentative: data.representative,
                spacesCount: data.spacesCount,
                price: data.price,
                ambients: data.ambients,
                appointmentCreateDTOs: transformedAppointments,
            };

            const [, error] = await toastWrapper(CreateProject(requestData), {
                loading: "Registrando proyecto...",
                success: "Proyecto registrado exitosamente!",
            });

            if (error)
            {
                console.error("Error al registrar el proyecto:", error);
                return;
            }

            // redirect
            r.push(".");
        }
        catch (error)
        {
            console.error("Error en el envío del formulario:", error);
            toast.error("Ocurrió un error al enviar el formulario");
        }
        finally
        {
            setIsSubmitting(false);
        }
    };

    return (
        <FormProvider {...formMethods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-5">
                <ClientData clients={clients} services={services} quotations={quotations} onServicesChange={setSelectedServices} />
                <ServiceDates services={services} enabledServices={selectedServices} />

                <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader className="h-4 w-4 animate-spin" />
                            Registrando...
                        </>
                    ) : (
                        "Registrar Servicio"
                    )}
                </Button>
            </form>
        </FormProvider>
    );
}

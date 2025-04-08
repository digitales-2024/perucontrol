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
    quotations: Array<components["schemas"]["Quotation3"]>;
}

export function ProjectForm({ clients, services, quotations }: ProjectFormProps)
{
    const [isSubmitting, setIsSubmitting] = useState(false);
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
            services: [],
            appointments: [],
        },
    });

    const {
        handleSubmit,
        formState: { errors },
    } = formMethods;

    const onSubmit = async(data: ClientDataSchema) =>
    {
        try
        {
            setIsSubmitting(true);

            // Validación adicional para asegurar el formato correcto
            const isValidAppointments = data.appointments.every((dateStr) =>
            {
                try
                {
                    return !isNaN(new Date(dateStr).getTime());
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
            const requestData = {
                clientId: data.clientId,
                quotationId: data.quotationId,
                services: data.services,
                address: data.address,
                area: data.area,
                spacesCount: data.spacesCount,
                price: data.price,
                appointments: data.appointments.map((date) =>
                {
                    // Asegurar formato ISO string
                    try
                    {
                        return new Date(date).toISOString();
                    }
                    catch
                    {
                        return date; // Si ya está en formato correcto
                    }
                }),
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <ClientData clients={clients} services={services} quotations={quotations} />
                <ServiceDates services={services} />

                {/* Mostrar errores generales del formulario */}
                {Object.keys(errors).length > 0 && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                        <p className="font-medium">
                            Por favor corrija los siguientes errores:
                        </p>
                        <ul className="mt-2 list-disc list-inside text-sm">
                            {Object.entries(errors).map(([key, error]) => (
                                <li key={key}>
                                    {error.message as string}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

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

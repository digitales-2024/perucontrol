"use client";

import { Input } from "@/components/ui/input";
import { AutoComplete, type Option } from "@/components/ui/autocomplete";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { components } from "@/types/api";
import { Bug, SprayCanIcon as Spray, Rat, Shield, ShieldCheck, ArrowLeft, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { type ProjectDataSchema, projectDataSchema } from "../../../schemas";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { UpdateProject } from "../../../actions";
import { toastWrapper } from "@/types/toasts";
import { redirect, useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Project } from "../../../types";
import { toast } from "sonner";

interface UpdateClientDataProps {
    clients: Array<components["schemas"]["Client"]>
    services: Array<components["schemas"]["Service"]>
    project: Project
}

// Mapa de iconos para servicios
const serviceIcons: Record<string, React.ReactNode> = {
    Desratización: <Rat className="h-3 w-3" />,
    Desinsectación: <Bug className="h-3 w-3" />,
    Fumigación: <Spray className="h-3 w-3" />,
    Desinfección: <Shield className="h-3 w-3" />,
};

// Máximo número de ambientes permitidos
const MAX_ENVIRONMENTS = 8;

export function UpdateClientData({ clients, services, project }: UpdateClientDataProps)
{
    const router = useRouter();

    // Estado local para manejar los ambientes
    const [environments, setEnvironments] = useState<Array<string>>(Array.isArray(project.ambients) ? project.ambients : []);
    const [addressOptions, setAddressOptions] = useState<Array<Option>>([]);

    const form = useForm<ProjectDataSchema>({
        resolver: zodResolver(projectDataSchema),
        defaultValues: {
            clientId: project.client?.id ?? "",
            quotationId: project.quotation?.id ?? null,
            services: project.services?.map((service) => service.id) ?? [],
            address: project.address ?? "",
            area: project.area ?? 0,
            spacesCount: project.spacesCount ?? 0,
            ambients: Array.isArray(project.ambients) ? project.ambients : [],
        },
    });

    const { setValue } = form;

    // Actualizar el campo ambients en el formulario cuando cambia environments
    useEffect(() =>
    {
        setValue("ambients", environments);
    }, [environments, setValue]);

    // Efecto para actualizar las opciones de dirección cuando cambia el cliente seleccionado

    useEffect(() =>
    {

        const selectedClient = clients.find((client) => client.id === form.getValues("clientId"));

        if (selectedClient)
        {
            const options: Array<Option> = [];

            // Agregar la dirección fiscal
            if (selectedClient.fiscalAddress)
            {
                options.push({
                    value: selectedClient.fiscalAddress,
                    label: selectedClient.fiscalAddress,
                });
            }

            // Agregar las direcciones de las ubicaciones del cliente
            selectedClient.clientLocations.forEach((location) =>
            {
                if (location.address)
                { // Asegúrate de que la dirección no sea nula
                    options.push({
                        value: location.address,
                        label: location.address,
                    });
                }
            });
            setAddressOptions(options);
        }
        else
        {
            setAddressOptions([]); // Si no hay cliente seleccionado, limpiar las opciones
        }

    }, [clients, form]);

    const activeClients = clients.filter((client) => client.isActive);

    const clientsOptions: Array<Option> =
        activeClients?.map((client) => ({
            value: client.id ?? "",
            label: client.razonSocial !== "" ? (client.razonSocial ?? "") : (client.name ?? ""),
        })) ?? [];

    const onSubmit = async(data: ProjectDataSchema) =>
    {
        // Verificar si la dirección está en las opciones
        const isAddressValid = addressOptions.some((option) => option.value === data.address);

        if (!isAddressValid)
        {
            // Mostrar un mensaje de error o manejar la validación
            toast.warning("La dirección seleccionada no es válida. Por favor, elige una dirección de la lista.");
            return;
        }

        // Asegurarse de que ambients esté actualizado con los valores más recientes
        const formattedData = {
            ...data,
            ambients: environments,
        };

        const [, err] = await toastWrapper(UpdateProject(project.id!, formattedData), {
            loading: "Cargando...",
            success: "Proyecto actualizado exitosamente",
        });
        if (err !== null)
        {
            return;
        }
        redirect("./");
    };

    const handleGoBack = () =>
    {
        router.back();
    };

    // Función para agregar un nuevo ambiente
    const addEnvironment = () =>
    {
        if (environments.length < MAX_ENVIRONMENTS)
        {
            setEnvironments([...environments, ""]);
        }
    };

    // Función para eliminar un ambiente
    const removeEnvironment = (index: number) =>
    {
        // Verificar si hay más de un ambiente antes de eliminar
        if (environments.length > 1)
        {
            setEnvironments(environments.filter((_, i) => i !== index));
        }
        else
        {
            // Mostrar un mensaje de advertencia si se intenta eliminar el último ambiente
            toast.warning("Debe haber al menos un ambiente.");
        }
    };

    // Función para actualizar un ambiente
    const updateEnvironment = (index: number, value: string) =>
    {
        const newEnvironments = [...environments];
        newEnvironments[index] = value;
        setEnvironments(newEnvironments);
    };

    // Verificar si se ha alcanzado el límite de ambientes
    const isMaxEnvironmentsReached = environments.length >= MAX_ENVIRONMENTS;

    return (
        <>
            <Button variant="outline" onClick={handleGoBack} className="flex w-[160px] gap-2 mt-5">
                <ArrowLeft className="h-4 w-4" />
                Volver
            </Button>

            <Card className="mt-5">
                <CardHeader>
                    <div className="flex justify-between">
                        <CardTitle className="text-xl font-semibold">
                            Datos del proyecto
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                            {/* Cliente */}
                            <FormField
                                control={form.control}
                                name="clientId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base">
                                            Cliente
                                        </FormLabel>
                                        <FormControl>
                                            <AutoComplete
                                                options={clientsOptions}
                                                placeholder="Buscar cliente..."
                                                emptyMessage="No se encontraron clientes"
                                                value={clientsOptions.find((option) => option.value === field.value) ?? undefined}
                                                onValueChange={(option) =>
                                                {
                                                    field.onChange(option?.value || "");
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Dirección */}
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Dirección
                                        </FormLabel>
                                        <FormControl>
                                            <AutoComplete
                                                options={addressOptions}
                                                placeholder="Selecciona una dirección"
                                                emptyMessage="No se encontraron direcciones"
                                                value={
                                                    addressOptions.find((option) => option.value ===
                                                        field.value) ?? undefined
                                                }
                                                onValueChange={(option) =>
                                                {
                                                    field.onChange(option?.value ?? "");
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Área y Número de ambientes */}
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="area"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Área m2
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="m2"
                                                    {...field}
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="spacesCount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Nro. de ambientes
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="#"
                                                    {...field}
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Servicios */}
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="services"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-medium">
                                                Servicios
                                            </FormLabel>
                                            <div className="grid grid-cols-2 gap-4 mt-2">
                                                {services.map((service) =>
                                                {
                                                    const isSelected = field.value?.includes(service.id!);
                                                    return (
                                                        <div
                                                            key={service.id}
                                                            className={cn(
                                                                "relative flex items-center p-2 rounded-lg border-2 cursor-pointer transition-all",
                                                                "hover:border-blue-400 hover:bg-blue-50",
                                                                isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200",
                                                            )}
                                                            onClick={() =>
                                                            {
                                                                // Solo permitir agregar servicios (no quitar)
                                                                if (!isSelected)
                                                                {
                                                                    const newValue = isSelected
                                                                        ? field.value?.filter((id) => id !== service.id)
                                                                        : [...(field.value || []), service.id!];
                                                                    field.onChange(newValue);
                                                                }
                                                            }}
                                                        >
                                                            <div className="mr-4">
                                                                {serviceIcons[service.name] ?? <ShieldCheck className="h-3 w-3" />}
                                                            </div>
                                                            <div>
                                                                <h3 className="text-sm font-medium">
                                                                    {service.name}
                                                                </h3>
                                                            </div>
                                                            {isSelected && (
                                                                <div className="absolute top-2 right-2 h-3 w-3 bg-blue-500 rounded-full" />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Nueva sección para tipos de ambientes */}
                            <div className="mt-6">
                                <Separator className="my-4" />
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <FormLabel className="text-base font-medium">
                                            Tipos de Ambientes
                                        </FormLabel>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Máximo
                                            {" "}
                                            {MAX_ENVIRONMENTS}
                                            {" "}
                                            ambientes (
                                            {environments.length}
                                            /
                                            {MAX_ENVIRONMENTS}
                                            )
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={addEnvironment}
                                        variant="outline"
                                        size="sm"
                                        className={cn(
                                            "flex items-center gap-1 border-blue-300",
                                            isMaxEnvironmentsReached
                                                ? "text-gray-400 border-gray-300 bg-gray-50 cursor-not-allowed"
                                                : "text-blue-600 hover:bg-blue-50",
                                        )}
                                        disabled={isMaxEnvironmentsReached}
                                    >
                                        <Plus className="h-4 w-4" />
                                        Agregar ambiente
                                    </Button>
                                </div>

                                <p className="text-sm text-gray-500 mb-4">
                                    Especifique los diferentes tipos de ambientes o espacios que existen en la ubicación (ej. oficinas,
                                    almacenes, baños, etc.)
                                </p>

                                <div className="space-y-3">
                                    {environments.length === 0 && (
                                        <div className="text-sm text-gray-500 italic p-3 border border-dashed border-gray-300 rounded-md text-center">
                                            No hay ambientes especificados. Agregue un ambiente para comenzar.
                                        </div>
                                    )}

                                    {environments.map((env, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <FormItem className="flex-1">
                                                <FormControl>
                                                    <Input
                                                        value={env}
                                                        onChange={(e) => updateEnvironment(index, e.target.value)}
                                                        placeholder="Nombre del ambiente (ej. Oficina principal)"
                                                        className="w-full"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeEnvironment(index)}
                                                className="h-10 w-10 text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <X className="h-4 w-4" />
                                                <span className="sr-only">
                                                    Eliminar ambiente
                                                </span>
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                {isMaxEnvironmentsReached && (
                                    <p className="text-amber-600 text-sm mt-2">
                                        Ha alcanzado el límite máximo de
                                        {" "}
                                        {MAX_ENVIRONMENTS}
                                        {" "}
                                        ambientes.
                                    </p>
                                )}
                            </div>

                            <Button type="submit" className="w-52 bg-blue-600 hover:bg-blue-700 mt-6">
                                Guardar
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </>
    );
}

export default UpdateClientData;

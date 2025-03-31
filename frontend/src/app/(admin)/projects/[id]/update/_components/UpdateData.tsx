"use client";

import { Input } from "@/components/ui/input";
import { AutoComplete, type Option } from "@/components/ui/autocomplete";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { components } from "@/types/api";
import { Bug, SprayCanIcon as Spray, Rat, Shield, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { clientDataSchema, ClientDataSchema } from "../../../schemas";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { UpdateProject } from "../../../actions";
import { toastWrapper } from "@/types/toasts";
import { redirect } from "next/navigation";

interface ProjectProps {
    id?: string;
    client?: components["schemas"]["Client"];
    services?: Array<components["schemas"]["Service"]>;
    quotation?: components["schemas"]["Quotation"];
    address: string;
    area: number;
    status: components["schemas"]["ProjectStatus"];
    spacesCount: number;
    modifiedAt?: string;
}

interface UpdateClientDataProps {
    clients: Array<components["schemas"]["Client"]>
    services: Array<components["schemas"]["Service"]>
    quotations: Array<components["schemas"]["Quotation3"]>
    project: ProjectProps
}

// Mapa de iconos para servicios
const serviceIcons: Record<string, React.ReactNode> = {
    Desratización: <Rat className="h-3 w-3" />,
    Desinsectación: <Bug className="h-3 w-3" />,
    Fumigación: <Spray className="h-3 w-3" />,
    Desinfección: <Shield className="h-3 w-3" />,
};

export function UpdateClientData({ clients, services, quotations, project }: UpdateClientDataProps)
{
    const [quotation, setQuotation] = useState(project.quotation?.id ?? "");
    // const [showQuotation, setShowQuotation] = useState(true);

    const form = useForm<ClientDataSchema>({
        resolver: zodResolver(clientDataSchema),
        defaultValues: {
            clientId: project.client?.id ?? "",
            quotationId: project.quotation?.id ?? null,
            services: project.services?.map((service) => service.id) ?? [],
            address: project.address ?? "",
            area: project.area ?? 0,
            spacesCount: project.spacesCount ?? 0,
        },
    });

    const { setValue } = form;

    const activeClients = clients.filter((client) => client.isActive);  // Filtrando los clientes activos
    const activeQuotations = quotations.filter((quotation) => quotation?.isActive);   // Filtrando las cotizaciones activas

    { /* Creando las opciones para el AutoComplete */ }
    const clientsOptions: Array<Option> =
        activeClients?.map((client) => ({
            value: client.id ?? "",
            label: client.razonSocial !== "" ? client.razonSocial ?? "" : client.name ?? "",
        })) ?? [];

    const quotationsOptions: Array<Option> =
        activeQuotations?.map((quotation) => ({
            value: quotation?.id ?? "",
            label: quotation?.id ?? "",
        })) ?? [];

    const handleQuotationChange = (option: Option | null) =>
    {
        const selectedQuotation = quotations.find((q) => q?.id === option?.value);
        if (selectedQuotation)
        {
            setValue("clientId", selectedQuotation.client?.id ?? "");
            setValue("quotationId", selectedQuotation.id ?? null);
            setValue("address", selectedQuotation.client?.fiscalAddress ?? "");
            setValue("area", selectedQuotation.area ?? 0);
            setValue("spacesCount", selectedQuotation.spacesCount ?? 0);
            setValue("services", selectedQuotation.services?.map((service) => service.id).filter((id): id is string => !!id) ?? []);
        }
    };

    const onSubmit = async(data: ClientDataSchema) =>
    {
        const [, err] = await toastWrapper(UpdateProject(project.id!, data), {
            loading: "Cargando...",
            success: "Proyecto actualizado exitosamente",
        });
        if (err !== null)
        {
            return;
        }
        redirect("./");
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between">
                    <CardTitle className="text-xl font-semibold">
                        Datos de cliente
                    </CardTitle>
                    <AutoComplete
                        options={quotationsOptions}
                        placeholder="Buscar cotización..."
                        emptyMessage="No se encontraron clientes"
                        value={
                            quotationsOptions.find((option) => option.value ===
                                quotation) ?? undefined
                        }
                        onValueChange={(option) =>
                        {
                            setQuotation(option?.value || "");
                            handleQuotationChange(option);
                        }}
                    />
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
                                            value={
                                                clientsOptions.find((option) => option.value ===
                                                    field.value) ?? undefined
                                            }
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
                                        <Input placeholder="Av. / Jr. / Calle Nro. Lt." {...field} />
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

                        {/* Servicios y Número de Orden */}
                        <div className="space-y-4">
                            {/* Servicios */}
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
                                                            const newValue = isSelected
                                                                ? field.value?.filter((id) => id !== service.id)
                                                                : [...(field.value || []), service.id!];
                                                            field.onChange(newValue);
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
                                                        {isSelected && <div className="absolute top-2 right-2 h-3 w-3 bg-blue-500 rounded-full" />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button type="submit" className="w-52 bg-blue-600 hover:bg-blue-700">
                            Guardar
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

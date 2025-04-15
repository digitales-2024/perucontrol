"use client";

import { Input } from "@/components/ui/input";
import { AutoComplete, type Option } from "@/components/ui/autocomplete";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { components } from "@/types/api";
import { Bug, SprayCanIcon as Spray, Rat, Shield, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";

interface ClientDataProps {
    clients: Array<components["schemas"]["Client"]>
    services: Array<components["schemas"]["Service"]>
    quotations: Array<components["schemas"]["Quotation3"]>
}

// Mapa de iconos para servicios
const serviceIcons: Record<string, React.ReactNode> = {
    Desratización: <Rat className="h-3 w-3" />,
    Desinsectación: <Bug className="h-3 w-3" />,
    Fumigación: <Spray className="h-3 w-3" />,
    Desinfección: <Shield className="h-3 w-3" />,
};

export function ClientData({ clients, services, quotations }: ClientDataProps)
{
    const { setValue, watch } = useFormContext();
    const [quotation, setQuotation] = useState("");
    const [showQuotation, setShowQuotation] = useState(true);
    const [clientAddressOptions, setClientAddressOptions] = useState<Array<Option>>([]);

    const activeClients = clients.filter((client) => client.isActive);  // Filtrando los clientes activos
    const activeQuotations = quotations.filter((quotation) => quotation?.isActive); // Filtrando las cotizaciones activas

    { /* Creando las opciones para el AutoComplete */ }
    const clientsOptions: Array<Option> =
        activeClients?.map((client) => ({
            value: client.id ?? "",
            label:
                client.name !== "" && client.name !== "-"
                    ? client.name
                    : client.razonSocial ?? "-",
        })) ?? [];

    const quotationsOptions: Array<Option> =
        activeQuotations?.map((quotation) => ({
            value: quotation?.id ?? "",
            label: `${quotation.client!.name} - #${quotation!.quotationNumber!}`,
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
            setValue(
                "services",
                selectedQuotation.services?.map((service) => service.id).filter((id): id is string => !!id) ?? [],
            );
            setValue("frequency", selectedQuotation.frequency);
            setValue("price", selectedQuotation.price);

            // Actualizar las direcciones del cliente asociado a la cotización
            const selectedClient = clients.find((client) => client.id === selectedQuotation.client?.id);
            if (selectedClient)
            {
                const addressOptions = [
                    ...(selectedClient.fiscalAddress
                        ? [{ value: selectedClient.fiscalAddress, label: `Fiscal: ${selectedClient.fiscalAddress}` }]
                        : []),
                    ...(selectedClient.clientLocations
                        ?.filter((location) => location.address?.trim() !== "") // Filtrar direcciones vacías
                        .map((location) => ({
                            value: location.address,
                            label: location.address,
                        })) ?? []),
                ];
                setClientAddressOptions(addressOptions);
            }
            else
            {
                setClientAddressOptions([]);
            }
        }
    };

    const handleClientChange = (option: Option | null) =>
    {
        const selectedClient = clients.find((client) => client.id === option?.value);
        if (selectedClient)
        {
            setValue("clientId", selectedClient.id ?? "");

            // Agregar la dirección fiscal como una opción adicional
            const addressOptions = [
                ...(selectedClient.fiscalAddress
                    ? [{ value: selectedClient.fiscalAddress, label: `Fiscal: ${selectedClient.fiscalAddress}` }]
                    : []),
                ...(selectedClient.clientLocations
                    ?.filter((location) => location.address?.trim() !== "") // Filtrando si hay direcciones vacias
                    .map((location) => ({
                        value: location.address,
                        label: location.address,
                    })) ?? []),
            ];
            setClientAddressOptions(addressOptions);
        }
        else
        {
            setValue("clientId", "");
            setClientAddressOptions([]);
        }
    };

    useEffect(() =>
    {
        const selectedClient = clients.find((client) => client.id === watch("clientId"));
        if (selectedClient)
        {
            const addressOptions = [
                ...(selectedClient.fiscalAddress
                    ? [{ value: selectedClient.fiscalAddress, label: `Fiscal: ${selectedClient.fiscalAddress}` }]
                    : []),
                ...(selectedClient.clientLocations?.map((location) => ({
                    value: location.address,
                    label: location.address,
                })) ?? []),
            ];

            setClientAddressOptions(addressOptions);
        }
    }, [clients, watch]);

    const handleClick = () =>
    {
        setShowQuotation(false);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between mt-5">
                    <CardTitle className="text-xl font-semibold">
                        Información general
                    </CardTitle>
                    {showQuotation ? (
                        <Button onClick={handleClick} className="bg-blue-600 hover:bg-blue-700">
                            Obtener datos de una cotización
                        </Button>
                    ) : (
                        <AutoComplete
                            options={quotationsOptions}
                            placeholder="Buscar cotización..."
                            emptyMessage="No se encontraron cotizaciones disponibles"
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
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {/* Cliente */}
                <FormField
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
                                        handleClientChange(option);
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Dirección */}
                <FormField
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Dirección
                            </FormLabel>
                            <FormControl>
                                <AutoComplete
                                    options={clientAddressOptions}
                                    placeholder="Av. / Jr. / Calle Nro. Lt."
                                    emptyMessage="No se encontraron dirreciones"
                                    value={
                                        clientAddressOptions.find((option) => option.value ===
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

                {/* Área y Número de ambientes */}
                <div className="grid grid-cols-2 gap-4">
                    <FormField
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
                                                        ? field.value?.filter((id: string) => id !== service.id)
                                                        : [...(field.value ?? []), service.id!];
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

                <FormField
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Costo del servicio
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    placeholder="S/."
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

            </CardContent>
        </Card>
    );
}

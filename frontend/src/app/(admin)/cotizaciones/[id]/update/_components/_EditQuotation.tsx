"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateQuotationSchema, quotationSchema } from "../../../schemas";
import { GetTermsAndConditionsById, UpdateQuotation } from "../../../actions";
import { AutoComplete, Option } from "@/components/ui/autocomplete";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import TermsAndConditions from "../../../_termsAndConditions/TermsAndConditions";
import { components } from "@/types/api";
import { toastWrapper } from "@/types/toasts";
import DatePicker from "@/components/ui/date-time-picker";
import { formatISO, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bug, Check, Rat, Shield, ShieldCheck, SprayCanIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Mapa de iconos para servicios
const serviceIcons: Record<string, React.ReactNode> = {
    Desratización: <Rat className="h-3 w-3" />,
    Desinsectación: <Bug className="h-3 w-3" />,
    Fumigación: <SprayCanIcon className="h-3 w-3" />,
    Desinfección: <Shield className="h-3 w-3" />,
    LimpiezaDeTanque: <ShieldCheck className="h-3 w-3" />,
};

type Quotation = components["schemas"]["Quotation3"];
type Terms = components["schemas"]["TermsAndConditions"];
type Clients = components["schemas"]["Client"]
type Services = components["schemas"]["Service"]

export default function EditQuotation({
    quotation,
    terms,
    clients,
    services,
}: {
    quotation: Quotation,
    terms: Array<Terms>,
    clients: Array<Clients>,
    services: Array<Services>
})
{
    const [termsOpen, setTermsOpen] = useState(false);
    const [clientAddressOptions, setClientAddressOptions] = useState<Array<Option>>([]);
    const router = useRouter();

    const activeClients = clients.filter((client) => client.isActive);

    // Creating options for AutoComplete
    const clientsOptions: Array<Option> =
        activeClients?.map((client) => ({
            value: client.id ?? "",
            label:
                client.contactName && client.contactName.trim() !== "" && client.contactName !== "-"
                    ? client.contactName
                    : client.name ?? "-",
        })) ?? [];

    const form = useForm<CreateQuotationSchema>({
        resolver: zodResolver(quotationSchema),
        defaultValues: {
            clientId: quotation?.client?.id ?? "",
            serviceIds: quotation?.services?.map((service) => service.id) ?? [],
            frequency: quotation?.frequency ?? "",
            area: quotation?.area ?? 0,
            spacesCount: quotation?.spacesCount ?? 0,
            hasTaxes: quotation?.hasTaxes ?? false,
            creationDate: quotation?.creationDate ?? "",
            expirationDate: quotation?.expirationDate ?? "",
            serviceAddress: quotation?.serviceAddress ?? "",
            paymentMethod: quotation?.paymentMethod ?? "",
            others: quotation?.others ?? "",
            serviceListText: quotation?.serviceListText ?? "",
            serviceDescription: quotation?.serviceDescription ?? "",
            serviceDetail: quotation?.serviceDetail ?? "",
            price: quotation?.price ?? 0,
            requiredAvailability: quotation?.requiredAvailability ?? "",
            serviceTime: quotation?.serviceTime ?? "",
            customField6: quotation?.customField6 ?? "",
            treatedAreas: quotation?.treatedAreas ?? "",
            deliverables: quotation?.deliverables ?? "",
            customField10: quotation?.customField10 ?? "",
        },
    });

    const { setValue, watch } = form;

    const watchedClientId = watch("clientId");

    // Observa los cambios en el campo 'serviceIds'
    const selectedServiceIds = watch("serviceIds");

    // Actualiza automáticamente el campo `serviceListText` cuando cambien los servicios seleccionados
    useEffect(() =>
    {
        const selectedServices = services
            .filter((service) => selectedServiceIds?.includes(service.id!))
            .map((service) => service.name)
            .join(", ");
        setValue("serviceListText", selectedServices);
    }, [selectedServiceIds, services, setValue]);

    const onSubmit = async(input: CreateQuotationSchema) =>
    {
        const [, err] = await toastWrapper(UpdateQuotation(quotation.id!, input), {
            loading: "Actualizando cotización...",
            success: "¡Cotización actualizada exitosamente!",
        });
        if (err !== null)
        {
            return;
        }
        router.push("/cotizaciones");
    };

    useEffect(() =>
    {
        const selectedClient = clients.find((client) => client.id === watchedClientId);
        if (selectedClient)
        {
            const addressOptions = [
                ...(selectedClient.fiscalAddress
                    ? [{ value: selectedClient.fiscalAddress, label: `Fiscal: ${selectedClient.fiscalAddress}` }]
                    : []),
                ...(selectedClient.clientLocations
                    ?.filter((location) => location.address?.trim() !== "")
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
    }, [watchedClientId, clients]);

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

    const handleTermsChange = async(id: string, fieldName: keyof CreateQuotationSchema) =>
    {
        const result = await GetTermsAndConditionsById(id);
        if (result)
        {
            const content = result[0].content; // Obtiene el contenido de la plantilla
            setValue(fieldName, content); // Actualiza solo el campo correspondiente
        }
        else
        {
            console.error("Error fetching terms and conditions:");
        }
    };

    return (
        <>
            <Card className="w-full mt-5">
                <CardHeader>
                    <CardTitle className="text-xl">
                        Editar cotización
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <ScrollArea className="h-full">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid gap-4">
                                    {/* Cliente */}
                                    <FormField
                                        control={form.control}
                                        name="clientId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-medium">
                                                    Cliente
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </FormLabel>
                                                <FormControl>
                                                    <AutoComplete
                                                        options={clientsOptions}
                                                        placeholder="Selecciona un cliente"
                                                        emptyMessage="No se encontraron clientes"
                                                        value={
                                                            clientsOptions.find((option) => option.value ===
                                                                field.value) ?? undefined
                                                        }
                                                        onValueChange={(option) =>
                                                        {
                                                            field.onChange(option?.value ?? "");
                                                            handleClientChange(option);
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="serviceAddress"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base">
                                                    Dirección del Servicio
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </FormLabel>
                                                <FormDescription>
                                                    Dirección donde se realizará el servicio. Puede ser diferente a la dirección fiscal del cliente.
                                                </FormDescription>
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

                                    <h3 className="text-lg font-bold mt-4">
                                        Servicios
                                        <span className="text-red-500">
                                            *
                                        </span>
                                    </h3>

                                    {/* Servicios */}
                                    <FormField
                                        control={form.control}
                                        name="serviceIds"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                                    {services.map((service) =>
                                                    {
                                                        const isSelected = field.value?.includes(service.id!);
                                                        return (
                                                            <div
                                                                key={service.id}
                                                                className={cn(
                                                                    "group relative flex items-center p-1 rounded-lg border-2 cursor-pointer transition-all",
                                                                    "hover:border-blue-400 hover:bg-blue-50/50",
                                                                    isSelected ? "border-blue-500 bg-blue-50/70" : "border-gray-200",
                                                                )}
                                                                onClick={() =>
                                                                {
                                                                    const newValue = isSelected
                                                                        ? field.value?.filter((id) => id !== service.id)
                                                                        : [...(field.value ?? []), service.id!];
                                                                    field.onChange(newValue);
                                                                }}
                                                            >
                                                                <div
                                                                    className={cn(
                                                                        "mr-4 transition-colors",
                                                                        isSelected ? "text-blue-500" : "text-gray-500",
                                                                        "group-hover:text-blue-500",
                                                                    )}
                                                                >
                                                                    {serviceIcons[service.name] ?? <Bug className="h-3 w-3" />}
                                                                </div>
                                                                <div>
                                                                    <h3 className="text-xs font-medium">
                                                                        {service.name}
                                                                    </h3>
                                                                </div>
                                                                {isSelected && (
                                                                    <div className="absolute top-2 right-2 h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                                        <Check className="h-3 w-3 text-white" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Frecuencia */}
                                    <FormField
                                        control={form.control}
                                        name="frequency"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-medium">
                                                    Frecuencia
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecciona la frecuencia" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Fortnightly">
                                                            Quincenal
                                                        </SelectItem>
                                                        <SelectItem value="Monthly">
                                                            Mensual
                                                        </SelectItem>
                                                        <SelectItem value="Bimonthly">
                                                            Bimestral
                                                        </SelectItem>
                                                        <SelectItem value="Quarterly">
                                                            Trimestral
                                                        </SelectItem>
                                                        <SelectItem value="Semiannual">
                                                            Semestral
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="creationDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2 font-medium">
                                                        Fecha de creación
                                                    </FormLabel>
                                                    <FormControl>
                                                        <DatePicker
                                                            value={field.value ? parseISO(field.value) : undefined}
                                                            onChange={(date) =>
                                                            {
                                                                if (date)
                                                                {
                                                                    const formattedDate = formatISO(date, { representation: "complete" });
                                                                    field.onChange(formattedDate);
                                                                }
                                                                else
                                                                {
                                                                    field.onChange("");
                                                                }
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="expirationDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2 font-medium">
                                                        Fecha de expiración
                                                    </FormLabel>
                                                    <FormControl>
                                                        <DatePicker
                                                            value={field.value ? parseISO(field.value) : undefined}
                                                            onChange={(date) =>
                                                            {
                                                                if (date)
                                                                {
                                                                    const formattedDate = formatISO(date, { representation: "complete" });
                                                                    field.onChange(formattedDate);
                                                                }
                                                                else
                                                                {
                                                                    field.onChange("");
                                                                }
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Área m2 */}
                                        <FormField
                                            control={form.control}
                                            name="area"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-base font-medium">
                                                        Área m2
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="m2" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Nro de Ambientes */}
                                        <FormField
                                            control={form.control}
                                            name="spacesCount"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-base font-medium">
                                                        Nro. de Ambientes
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="#" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="paymentMethod"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-medium">
                                                    Método de pago
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Método de pago" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-medium">
                                                    Precio
                                                </FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="Precio del servicio" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* IGV */}
                                    <FormField
                                        control={form.control}
                                        name="hasTaxes"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel className="text-base font-medium">
                                                        IGV
                                                    </FormLabel>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="serviceListText"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-medium">
                                                    Lista de servicios
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Listado detallado de servicios"
                                                        className="min-h-[100px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="serviceDescription"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-medium">
                                                    Descripción del servicio
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Descripción detallada del servicio"
                                                        className="min-h-[100px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="serviceDetail"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-medium">
                                                    Detalle del servicio
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Detalle específico del servicio"
                                                        className="min-h-[100px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="treatedAreas"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-medium">
                                                    Áreas tratadas
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Áreas que serán tratadas"
                                                        className="min-h-[100px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <h3 className="text-lg font-bold mt-4">
                                        Otra información
                                    </h3>

                                    <Button type="button" className="w-[165px] justify-start cursor-pointer" variant="outline" onClick={() => setTermsOpen(true)}>
                                        Crear Plantilla
                                    </Button>

                                    <div className="space-y-2">
                                        <FormLabel htmlFor="requiredAvailability">
                                            Disponibilidad Requerida
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormDescription>
                                            Qué disponibilidad se requiere para realizar el servicio. Se mostrará en el punto 3 de los términos y condiciones.
                                        </FormDescription>
                                        <div className="flex flex-col gap-2">
                                            <Select onValueChange={(id) => handleTermsChange(id, "requiredAvailability")}>
                                                <SelectTrigger className="border rounded-md">
                                                    <SelectValue placeholder="Seleccione una plantilla" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {
                                                            terms.map((terms) => (
                                                                <SelectItem key={terms.id} value={terms.id ?? ""}>
                                                                    {terms.name}
                                                                </SelectItem>
                                                            ))
                                                        }
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>

                                            <FormField
                                                control={form.control}
                                                name="requiredAvailability"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder="Plantillas de la disponibilidad requerida"
                                                                className="resize-none"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <FormLabel htmlFor="serviceTime">
                                            Hora del servicio
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormDescription>
                                            A qué hora se realizará el servicio. Se mostrará en el punto 5 de los términos y condiciones.
                                        </FormDescription>
                                        <div className="flex flex-col gap-2">
                                            <Select onValueChange={(id) => handleTermsChange(id, "serviceTime")}>
                                                <SelectTrigger className="border rounded-md">
                                                    <SelectValue placeholder="Seleccione una plantilla" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {
                                                            terms.map((terms) => (
                                                                <SelectItem key={terms.id} value={terms.id ?? ""}>
                                                                    {terms.name}
                                                                </SelectItem>
                                                            ))
                                                        }
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>

                                            <FormField
                                                control={form.control}
                                                name="serviceTime"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder="Plantillas de hora del servicio"
                                                                className="resize-none"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <FormLabel htmlFor="customField6">
                                            Campo Personalizado 6
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormDescription>
                                            A qué hora se realizará el servicio. Se mostrará en el punto 5 de los términos y condiciones.
                                        </FormDescription>
                                        <div className="flex flex-col gap-2">
                                            <Select onValueChange={(id) => handleTermsChange(id, "customField6")}>
                                                <SelectTrigger className="border rounded-md">
                                                    <SelectValue placeholder="Seleccione una plantilla" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {
                                                            terms.map((terms) => (
                                                                <SelectItem key={terms.id} value={terms.id ?? ""}>
                                                                    {terms.name}
                                                                </SelectItem>
                                                            ))
                                                        }
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>

                                            <FormField
                                                control={form.control}
                                                name="customField6"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder="Plantilla Campo Personalizado 6"
                                                                className="resize-none"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <FormLabel htmlFor="deliverables">
                                            Entregables
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormDescription>
                                            Qué se entregará al cliente. Se mostrará en el punto 8 de los términos y condiciones.
                                        </FormDescription>
                                        <div className="flex flex-col gap-2">
                                            <Select onValueChange={(id) => handleTermsChange(id, "deliverables")}>
                                                <SelectTrigger className="border rounded-md">
                                                    <SelectValue placeholder="Seleccione una plantilla" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {
                                                            terms.map((terms) => (
                                                                <SelectItem key={terms.id} value={terms.id ?? ""}>
                                                                    {terms.name}
                                                                </SelectItem>
                                                            ))
                                                        }
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>

                                            <FormField
                                                control={form.control}
                                                name="deliverables"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder="Plantilla de Entregables"
                                                                className="resize-none"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <FormLabel htmlFor="customField10">
                                            Campo Personalizado 10
                                        </FormLabel>
                                        <FormDescription>
                                            Punto 10 de los términos y condiciones.
                                        </FormDescription>
                                        <div className="flex flex-col gap-2">
                                            <Select onValueChange={(id) => handleTermsChange(id, "customField10")}>
                                                <SelectTrigger className="border rounded-md">
                                                    <SelectValue placeholder="Seleccione una plantilla" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {
                                                            terms.map((terms) => (
                                                                <SelectItem key={terms.id} value={terms.id ?? ""}>
                                                                    {terms.name}
                                                                </SelectItem>
                                                            ))
                                                        }
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>

                                            <FormField
                                                control={form.control}
                                                name="customField10"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder="Plantilla del Campo Personalizado 10"
                                                                className="resize-none"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                        </div>
                                    </div>

                                </div>

                                <div className="flex flex-wrap gap-2 justify-end space-x-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.push("/cotizaciones")}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                        Guardar cambios
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </ScrollArea>
                </CardContent>
            </Card>

            {termsOpen && (
                <TermsAndConditions
                    open={termsOpen}
                    setOpen={setTermsOpen}
                    termsAndConditions={terms}
                />
            )}
        </>
    );
}

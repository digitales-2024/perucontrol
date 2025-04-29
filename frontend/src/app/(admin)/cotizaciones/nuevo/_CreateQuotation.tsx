"use client";

import { Button } from "@/components/ui/button";
import { SheetFooter } from "@/components/ui/sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { /* useFieldArray, */ useForm } from "react-hook-form";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { GetTermsAndConditionsById, RegisterQuotation } from "../actions";
import { CreateQuotationSchema, quotationSchema } from "../schemas";
import { AutoComplete, Option } from "@/components/ui/autocomplete";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Bug, SprayCanIcon as Spray, Rat, Shield, Check, ShieldCheck/* , X */ } from "lucide-react";
import { toastWrapper } from "@/types/toasts";
import DatePicker from "@/components/ui/date-time-picker";
import { addDays, format, parse } from "date-fns";
import { components, paths } from "@/types/api";
import { redirect } from "next/navigation";
import TermsAndConditions from "../_termsAndConditions/TermsAndConditions";
import { Textarea } from "@/components/ui/textarea";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mapa de iconos para servicios
const serviceIcons: Record<string, React.ReactNode> = {
    Desratización: <Rat className="h-3 w-3" />,
    Desinsectación: <Bug className="h-3 w-3" />,
    Fumigación: <Spray className="h-3 w-3" />,
    Desinfección: <Shield className="h-3 w-3" />,
    LimpiezaDeTanque: <ShieldCheck className="h-3 w-3" />,
};

type Terms = components["schemas"]["TermsAndConditions"];
type Clients = components["schemas"]["Client"];
type Services = paths["/api/Service"]["get"]["responses"]["200"]["content"]["application/json"];

export function CreateQuotation({ terms, clients, services }: {
    terms: Array<Terms>,
    clients: Array<Clients>,
    services: Services,
})
{
    const [openTerms, setOpenTerms] = useState(false);
    const activeClients = clients.filter((client) => client.isActive);  // Filtrando los clientes activos
    const [clientAddressOptions, setClientAddressOptions] = useState<Array<Option>>([]);

    /* const { fields: serviceDetailFields, append: appendServiceDetail, remove: removeServiceDetail } = */

    /* useFieldArray({
        control: form.control,
        name: "serviceDetails",
    }); */

    { /* Creando las opciones para el AutoComplete */ }
    const clientsOptions: Array<Option> =
        activeClients?.map((client) => ({
            value: client.id ?? "",
            label:
                client.name !== "" && client.name !== "-"
                    ? client.name
                    : client.razonSocial ?? "-",
        })) ?? [];

    const form = useForm<CreateQuotationSchema>({
        resolver: zodResolver(quotationSchema),
        defaultValues: {
            clientId: "",
            serviceIds: [],
            area: 0,
            spacesCount: 0,
            frequency: "Bimonthly",
            hasTaxes: false,
            creationDate: format(new Date(), "yyyy-MM-dd"),
            expirationDate: format(addDays(new Date(), 7), "yyyy-MM-dd"),
            serviceAddress: "",
            paymentMethod: "",
            others: "",
            serviceListText: "",
            serviceDescription: "",
            serviceDetail: "",
            price: 0,
            requiredAvailability: "",
            serviceTime: "",
            customField6: "",
            treatedAreas: "",
            deliverables: "",
            customField10: "",
        },
    });

    const { setValue, watch } = form;

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

    const handleClientChange = (option: Option | null) =>
    {
        const selectedClient = clients.find((client) => client.id === option?.value);
        if (selectedClient)
        {
            setValue("clientId", selectedClient.id ?? "");

            // Agregar la dirección fiscal como una opción adicional
            const addressOptions = [
                ...(selectedClient.fiscalAddress
                    ? [{ value: selectedClient.fiscalAddress, label: `${selectedClient.fiscalAddress}` }]
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

    const onSubmit = async(input: CreateQuotationSchema) =>
    {
        console.log("Entro");
        const [, err] = await toastWrapper(RegisterQuotation(input), {
            loading: "Cargando...",
            success: "Cotización registrada exitosamente",
        });
        if (err !== null)
        {
            return;
        }

        redirect("./");
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

    /* const handleServiceSelection = (serviceId: string) =>
    {
        const currentServices = watch("serviceIds") ?? [];
        let newServices: Array<string>;

        if (currentServices.includes(serviceId))
        {
        // Si ya está, lo quitamos
            newServices = currentServices.filter((id: string) => id !== serviceId);

            // También removemos el serviceDetail correspondiente
            const indexToRemove = serviceDetailFields.findIndex((detail) => detail.serviceId === serviceId);

            if (indexToRemove !== -1)
            {
                removeServiceDetail(indexToRemove);
            }
        }
        else
        {
        // Si no está, lo agregamos
            newServices = [...currentServices, serviceId];

            // También agregamos un nuevo serviceDetail con valores por defecto
            appendServiceDetail({
                serviceId: serviceId,
                description: "",
                quantity: 1,
                accessories: "",
                price: 0,
            });
        }

        setValue("serviceIds", newServices);
    }; */

    return (
        <div className="mt-5 ml-3">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                    <div className="mx-4 grid gap-3">

                        <h3 className="text-lg font-bold mt-4">
                            Información del Cliente
                        </h3>

                        {/* Cliente */}
                        <FormField
                            control={form.control}
                            name="clientId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base">
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
                                        {/* <Input placeholder="Dirección del Servicio" {...field} /> */}
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

                        <hr />

                        <h3 className="text-lg font-bold mt-4">
                            Datos de la cotización
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="creationDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2 font-medium">
                                            Fecha de creación
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormDescription>
                                            Fecha en la que se entrega la cotización al cliente
                                        </FormDescription>
                                        <FormControl>
                                            <DatePicker
                                                value={field.value ? parse(field.value, "yyyy-MM-dd", new Date()) : undefined}
                                                onChange={(date) =>
                                                {
                                                    if (date)
                                                    {
                                                        const formattedDate = format(date, "yyyy-MM-dd");
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
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormDescription>
                                            Fecha en la que expira la cotización
                                        </FormDescription>
                                        <FormControl>
                                            <DatePicker
                                                value={field.value ? parse(field.value, "yyyy-MM-dd", new Date()) : undefined}
                                                onChange={(date) =>
                                                {
                                                    if (date)
                                                    {
                                                        const formattedDate = format(date, "yyyy-MM-dd");
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

                        <hr />

                        <h3 className="text-lg font-bold mt-4">
                            Servicios
                            <span className="text-red-500">
                                *
                            </span>
                        </h3>

                        {/* Servicio */}
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

                        {/*  Renderizar los detalles del servicio */}
                        {/*  {serviceDetailFields.map((field, index) =>
                        {
                            const service = services.find((s) => s.id === field.serviceId);
                            return service ? (
                                <Card key={`service-${field.serviceId}`} className="mb-4">
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            {serviceIcons[service.name] ?? <ShieldCheck className="h-4 w-4" />}
                                            {service.name}
                                        </CardTitle>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleServiceSelection(field.serviceId)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="grid gap-4 grid-cols-1 md:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name={`serviceDetails.${index}.description`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Descripción
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Descripción del servicio"
                                                            className="resize-none"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name={`serviceDetails.${index}.quantity`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Cantidad
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="1"
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
                                            name={`serviceDetails.${index}.accessories`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Accesorios
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name={`serviceDetails.${index}.price`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Precio unitario
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
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
                            ) : null;
                        })} */}

                        {/* Frequency */}
                        <FormField
                            control={form.control}
                            name="frequency"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base">
                                        Frecuencia de trabajos (cronograma)
                                        <span className="text-red-500">
                                            *
                                        </span>
                                    </FormLabel>
                                    <FormDescription>
                                        Cada cuanto se realizará el servicio.
                                    </FormDescription>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            {/* Área m2 */}
                            <FormField
                                control={form.control}
                                name="area"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base">
                                            Área m2
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="m2" className="border rounded-md" {...field} />
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
                                        <FormLabel className="text-base">
                                            Nro. de Ambientes
                                            <span className="text-red-500">
                                                *
                                            </span>
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
                            name="serviceDescription"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base">
                                        Descripción del Servicio
                                        <span className="text-red-500">
                                            *
                                        </span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Descripción del Servicio" {...field} />
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
                                    <FormLabel className="text-base">
                                        Detalle del Servicio
                                        <span className="text-red-500">
                                            *
                                        </span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Detalle del Servicio" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="serviceListText"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base">
                                        Lista de Servicios
                                        <span className="text-red-500">
                                            *
                                        </span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Lista de Servicios" {...field} />
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
                                    <FormLabel className="text-base">
                                        Ambientes a tratar
                                        <span className="text-red-500">
                                            *
                                        </span>
                                    </FormLabel>
                                    <FormDescription>
                                        Áreas específicas que se tratarán. Se mostrará en el punto 7. de los términos y condiciones.
                                    </FormDescription>
                                    <FormControl>
                                        <Input placeholder="Áreas Tratadas" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <hr />

                        <h3 className="text-lg font-bold mt-4">
                            Costos y facturación
                        </h3>

                        {/* IGV */}
                        <div className="flex gap-2">
                            <FormLabel className="text-base mt-1">
                                ¿Incluye IGV?
                            </FormLabel>
                            <FormField
                                control={form.control}
                                name="hasTaxes"
                                render={({ field }) => (
                                    <FormItem className="flex py-2">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="paymentMethod"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base">
                                            Método de Pago
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormDescription>
                                            Método de Pagos para la cotización. Ejm: Transferencia, Efectivo, YAPE, etc.
                                        </FormDescription>
                                        <FormControl>
                                            <Input placeholder="Transferencia" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="others"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base">
                                            Otros
                                        </FormLabel>
                                        <FormDescription>
                                            Información adicional acerca del pago
                                        </FormDescription>
                                        <FormControl>
                                            <Input placeholder="Otros" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base">
                                        Precio
                                        <span className="text-red-500">
                                            *
                                        </span>
                                    </FormLabel>
                                    <FormDescription>
                                        Este precio se mostrará en la cotización, y también se usará para calcular los ingresos.
                                    </FormDescription>
                                    <FormControl>
                                        <Input placeholder="Precio" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <hr />

                        <h3 className="text-lg font-bold mt-4">
                            Otra información
                        </h3>

                        <Button type="button" variant="secondary" className="w-[165px] justify-start cursor-pointer" onClick={() => setOpenTerms(true)}>
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

                    <SheetFooter>
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                            Guardar
                        </Button>
                    </SheetFooter>
                </form>
            </Form>

            <TermsAndConditions
                open={openTerms}
                setOpen={setOpenTerms}
                termsAndConditions={terms}
            />
        </div>
    );
}

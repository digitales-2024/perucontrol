"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useFieldArray, useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateQuotationSchema, quotationSchema } from "../../../schemas";
import { GetTermsAndConditionsById, UpdateQuotation } from "../../../actions";
import { AutoComplete, Option } from "@/components/ui/autocomplete";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { components } from "@/types/api";
import { toastWrapper } from "@/types/toasts";
import DatePicker from "@/components/ui/date-time-picker";
import { formatISO, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bug, Check, Rat, Shield, ShieldCheck, SprayCanIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import TermsAndConditions from "../../../_termsAndConditions/TermsAndConditions";

// Mapa de iconos para servicios
const serviceIcons: Record<string, React.ReactNode> = {
    Desratización: <Rat className="h-3 w-3" />,
    Desinsectación: <Bug className="h-3 w-3" />,
    Fumigación: <SprayCanIcon className="h-3 w-3" />,
    Desinfección: <Shield className="h-3 w-3" />,
    LimpiezaDeTanque: <ShieldCheck className="h-3 w-3" />,
};

type Quotation = components["schemas"]["Quotation2"];
type Clients = components["schemas"]["Client"]
type Services = components["schemas"]["Service"]
type Terms = components["schemas"]["TermsAndConditions"];

export default function EditQuotation({
    quotation,
    clients,
    services,
    terms,
}: {
    quotation: Quotation,
    clients: Array<Clients>,
    services: Array<Services>
    terms: Array<Terms>,
})
{
    const [clientAddressOptions, setClientAddressOptions] = useState<Array<Option>>([]);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [openTerms, setOpenTerms] = useState(false);
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
            serviceIds: quotation?.services?.map((service) => service.id!) ?? [],
            frequency: quotation?.frequency ?? "",
            hasTaxes: quotation?.hasTaxes ?? false,
            creationDate: quotation?.creationDate ?? "",
            expirationDate: quotation?.expirationDate ?? "",
            serviceAddress: quotation?.serviceAddress ?? "",
            paymentMethod: quotation?.paymentMethod ?? "",
            others: quotation?.others ?? "",
            availability: quotation?.availability ?? "",
            quotationServices: quotation?.quotationServices?.map((service) => ({
                id: service.id ?? null,
                amount: service.amount ?? 1,
                nameDescription: service.nameDescription ?? "",
                price: service.price !== null ? Number(service.price) : undefined,
                accesories: service.accesories ?? undefined,
            })) ?? [],
            desinsectant: quotation?.desinsectant ?? "",
            derodent: quotation?.derodent ?? "",
            disinfectant: quotation?.disinfectant ?? "",
            termsAndConditions: quotation?.termsAndConditions?.length === 9
                ? quotation.termsAndConditions
                : [
                    "",
                ],
        },
    });

    const { setValue, watch } = form;

    const { fields: quotationServiceFields, append, remove } = useFieldArray({
        control: form.control,
        name: "quotationServices",
    });

    const watchedClientId = watch("clientId");
    const selectedServiceIds = watch("serviceIds");

    useEffect(() =>
    {
        if (isInitialLoad)
        {
            setIsInitialLoad(false);
            return;
        }

        const currentServices = form.getValues("quotationServices");
        const selectedServices = services.filter((s) => selectedServiceIds?.includes(s.id!));

        // Servicios a agregar (nuevos seleccionados)
        const servicesToAdd = selectedServices.filter((service) => !currentServices.some((s) => s.nameDescription === service.name));

        // Servicios a remover (desmarcados)
        const servicesToRemove = currentServices.filter((service) => !selectedServices.some((s) => s.name === service.nameDescription));

        // Agregar nuevos servicios seleccionados
        servicesToAdd.forEach((service) =>
        {
            append({
                id: null,
                amount: 1,
                nameDescription: service.name,
                price: 0,
                accesories: "",
            });
        });

        // Eliminar servicios desmarcados
        servicesToRemove.forEach((service) =>
        {
            const index = currentServices.findIndex((s) => s.nameDescription === service.nameDescription);
            if (index !== -1)
            {
                remove(index);
            }
        });

    }, [selectedServiceIds, services, form, append, remove, isInitialLoad]);

    const onSubmit = async(input: CreateQuotationSchema) =>
    {
        const transformedInput = {
            ...input,
            quotationServices: input.quotationServices.map((service) => ({
                ...service,
                id: service.id ?? null, // o service.id si existe
                price: service.price ?? null,
                accesories: service.accesories ?? null,
            })),
            termsAndConditions: input.termsAndConditions.filter((x) => x !== undefined),
        };

        const [, err] = await toastWrapper(UpdateQuotation(quotation.id!, transformedInput), {
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

    const handleTermsChange = async(id: string, fieldName: `termsAndConditions.${number}`) =>
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
        <Card className="w-full mt-5 bg-transparent">
            <CardHeader className="p-0">
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

                                <h3 className="text-lg font-bold mt-4">
                                    Detalle de Servicios
                                </h3>

                                {quotationServiceFields.map((field, index) => (
                                    <div key={field.id} className="border p-4 rounded mb-4 bg-gray-50">
                                        <Label className="text-lg font-semibold block mb-3">
                                            {field.nameDescription}
                                        </Label>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name={`quotationServices.${index}.amount`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Cantidad
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min={1}
                                                                {...field}
                                                                onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`quotationServices.${index}.price`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Precio
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                {...field}
                                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name={`quotationServices.${index}.nameDescription`}
                                            render={({ field }) => (
                                                <FormItem className="mt-4">
                                                    <FormLabel>
                                                        Descripción del Servicio
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Descripción detallada del servicio"
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
                                            name={`quotationServices.${index}.accesories`}
                                            render={({ field }) => (
                                                <FormItem className="mt-4">
                                                    <FormLabel>
                                                        Accesorios
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Accesorios requeridos para el servicio"
                                                            className="resize-none"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                ))}

                                <h3 className="text-lg font-bold mt-4">
                                    Productos a utilizar
                                </h3>

                                <FormField
                                    control={form.control}
                                    name="desinsectant"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Desinsectante
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Desinsectación"
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
                                    name="derodent"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Derodentizante
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Derodentizante"
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
                                    name="disinfectant"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Desinfectante
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Desinfectante"
                                                    className="resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
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

                                <hr />
                                <h3 className="text-lg font-bold mt-4">
                                    Costos y facturación
                                </h3>

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

                                <div>
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
                                        name="others"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base">
                                                    Observaciones
                                                </FormLabel>
                                                <FormDescription>
                                                    Observaciones acerca del pago
                                                </FormDescription>
                                                <FormControl>
                                                    <Input placeholder="Otros" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                </div>

                                <div>
                                    <FormField
                                        control={form.control}
                                        name="availability"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Disponibilidad Requerida
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                </div>
                            </div>

                            <h3 className="text-lg font-bold mt-4">
                                Términos y Condiciones
                                <span className="text-red-500">
                                    *
                                </span>
                            </h3>

                            <Button type="button" variant="secondary" className="w-[165px] justify-start cursor-pointer" onClick={() => setOpenTerms(true)}>
                                Crear Plantilla
                            </Button>

                            {Array.from({ length: 9 }).map((_, index) => (
                                <div key={index} className="flex flex-col gap-2">
                                    <Select onValueChange={(id) => handleTermsChange(id, `termsAndConditions.${index}`)}>
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
                                        name={`termsAndConditions.${index}`}
                                        render={({ field }) => (
                                            <FormItem className="mb-4">
                                                <FormLabel>
                                                    Punto
                                                    {" "}
                                                    {index + 1}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            ))}

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

                    <TermsAndConditions
                        open={openTerms}
                        setOpen={setOpenTerms}
                        termsAndConditions={terms}
                    />
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

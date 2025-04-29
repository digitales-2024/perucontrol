"use client";

import { Button } from "@/components/ui/button";
import { SheetFooter } from "@/components/ui/sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
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
import { Bug, SprayCanIcon as Spray, Rat, Shield, Check, ShieldCheck } from "lucide-react";
import { toastWrapper } from "@/types/toasts";
import DatePicker from "@/components/ui/date-time-picker";
import { addDays, format, parse } from "date-fns";
import { components, paths } from "@/types/api";
import { redirect } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import TermsAndConditions from "../_termsAndConditions/TermsAndConditions";

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
    const activeClients = clients.filter((client) => client.isActive);  // Filtrando los clientes activos
    const [clientAddressOptions, setClientAddressOptions] = useState<Array<Option>>([]);
    const [openTerms, setOpenTerms] = useState(false);

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
            frequency: "Bimonthly",
            hasTaxes: false,
            creationDate: format(new Date(), "yyyy-MM-dd"),
            expirationDate: format(addDays(new Date(), 7), "yyyy-MM-dd"),
            serviceAddress: "",
            paymentMethod: "",
            others: "",
            availability: "",
            quotationServices: [],
            desinsectant: "",
            derodent: "",
            disinfectant: "",
            termsAndConditions: [
                "Los costos NO inlcuyen IGV.",
                "El costo es siempre y cuando el trabajo sea preventivo, y no exista algun tipó de plaga existente.",
                "Hora de Ingreso: A coordinar con el personal encargado.",
                "Ambientes a Tratar:\n- 1er piso área de desecho, chichas,área de pollo.\n- 2do. piso producción de kekes, producción de tortas decoradas, área de productos por salir, panadería, baño hombre.\n- 3er. piso almacén, área de producción de aderezo, almacén, baño mujer , área de producción de helados, área de dosimetria de helado, oficina y pasadizo,\n- 4to. piso. comedor y cambiadores azotea.",
                "Todos nuestros productos cuentan con MDSD, Ficha Tecnica y Resolucion Directoral emitida por DIGESA.",
                "Seguridad:\n- Nuestro personal cuenta con SCITR de Pearson y Salud.\n- Nuestro personal cuenta con los EPPS necesarios a la actividad a realizar y las exigidas por ley.",
                "Garantía: PERUCIONTROL COM BEL, garantiza el control de sectores propios del local (biletele germánica, moscas y credores.) . De encontrarse otro sector se procederá a una evaluación técnica y se evaluará la consecuencia de haber realizado un servicio mal ejecutado o si el orden y la limpieza es deficiente entre factores o encontrarse.",
                "Documentos a entregar: Informe tecnico, Planilla de Operaciones, Mapa Murino, Registro de Ronduras, certificados y factura del servicio.",
                "REPROGRAMACION DEL SERVICIO:  hay algun cambio de dia! El cliente tendrá que avisar con 12 horas de anticipacion para su nueva reprogramación"],
        },
    });

    const { setValue, watch } = form;

    const { fields: quotationServiceFields, append, remove } = useFieldArray({
        control: form.control,
        name: "quotationServices",
    });

    // Observa los cambios en el campo 'serviceIds'
    const selectedServiceIds = watch("serviceIds");

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
        console.log("Input", JSON.stringify(input, null, 2));
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

    useEffect(() =>
    {
        const currentQuotationServices = form.getValues("quotationServices");
        const currentServiceNames = currentQuotationServices.map((q) => q.nameDescription);
        const selectedServices = services.filter((service) => selectedServiceIds.includes(service.id!));
        const selectedServiceNames = selectedServices.map((s) => s.name);

        // Remove services that are no longer selected
        const indicesToRemove = currentQuotationServices
            .map((service, index) => ({ ...service, index }))
            .filter((service) => !selectedServiceNames.includes(service.nameDescription))
            .map((service) => service.index)
            .sort((a, b) => b - a); // Sort descending to avoid index shift issues

        indicesToRemove.forEach((index) =>
        {
            remove(index);
        });

        // Add newly selected services
        selectedServices.forEach((service) =>
        {
            if (!currentServiceNames.includes(service.name))
            {
                append({
                    amount: 1,
                    nameDescription: service.name,
                    price: 0,
                    accesories: "",
                });
            }
        });
    }, [selectedServiceIds, services, form, append, remove]);

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

                        {/*  Renderizar los detalles del servicio */}
                        <h3 className="text-lg font-bold mt-4">
                            Detalle de Servicios
                        </h3>

                        {quotationServiceFields.map((field, index) => (
                            <div key={field.id} className="border p-4 rounded mb-2 bg-gray-50">

                                <Label className="text-xl font-bold">
                                    {field.nameDescription}
                                </Label>

                                <FormField
                                    control={form.control}
                                    name={`quotationServices.${index}.amount`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Cantidad
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name={`quotationServices.${index}.nameDescription`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Nombre / Descripción
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Nombre y Descripción del servicio"
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

                                <FormField
                                    control={form.control}
                                    name={`quotationServices.${index}.accesories`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Accesorios
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Accesorios a utilizar en el servicio"
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

                        <div>
                            <FormField
                                control={form.control}
                                name="availability"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Disponibilidad
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
                                        <FormItem>
                                            <FormLabel>
                                                Punto
                                                {" "}
                                                {" "}
                                                {index + 1}
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder={`Ingrese el texto para el punto ${index + 1}`}
                                                    className="resize-none"
                                                    rows={6}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                        ))}
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

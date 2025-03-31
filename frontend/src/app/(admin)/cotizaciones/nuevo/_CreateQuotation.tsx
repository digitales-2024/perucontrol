"use client";

import { Button } from "@/components/ui/button";
import { SheetFooter } from "@/components/ui/sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
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
import { format, parse } from "date-fns";
import { components, paths } from "@/types/api";
import { redirect } from "next/navigation";

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

    { /* Creando las opciones para el AutoComplete */ }
    const clientsOptions: Array<Option> =
        activeClients?.map((client) => ({
            value: client.id ?? "",
            label: client.name ?? "-",
        })) ?? [];

    const form = useForm<CreateQuotationSchema>({
        resolver: zodResolver(quotationSchema),
        defaultValues: {
            clientId: "",
            serviceIds: [],
            frequency: "Bimonthly",
            area: 0,
            spacesCount: 0,
            hasTaxes: false,
            creationDate: format(new Date(), "yyyy-MM-dd"),
            expirationDate: "",
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

    const onSubmit = async(input: CreateQuotationSchema) =>
    {
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

    const handleTermsChange = async(id: string) =>
    {
        const result = await GetTermsAndConditionsById(id);
        if (result)
        {
            //const content = result[0].content;
            // setValue("termsAndConditions", content);
        }
        else
        {
            console.error("Error fetching terms and conditions:");
        }
    };

    return (
        <div>

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
                                    </FormLabel>
                                    <FormDescription>
                                        Dirección donde se realizará el servicio. Puede ser diferente a la dirección fiscal del cliente.
                                    </FormDescription>
                                    <FormControl>
                                        <Input placeholder="Dirección del Servicio" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <hr />

                        <h3 className="text-lg font-bold mt-4">
                            Datos de la cotización
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="creationDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2 font-medium">
                                            Fecha de creación
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
                        </h3>

                        {/* Servicio */}
                        <FormField
                            control={form.control}
                            name="serviceIds"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base font-medium">
                                        Servicios
                                    </FormLabel>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
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

                        {/* Frequency */}
                        <FormField
                            control={form.control}
                            name="frequency"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base">
                                        Frecuencia de trabajos (cronograma)
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

                        <div className="grid grid-cols-2 gap-4 items-end">
                            {/* Área m2 */}
                            <FormField
                                control={form.control}
                                name="area"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base">
                                            Área m2
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
                                        </FormLabel>
                                        <FormDescription>
                                            Método de Pago a mostrar en la cotización. Ejm: Transferencia, Efectivo, YAPE, etc.
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

                        <div className="space-y-2">
                            <FormLabel htmlFor="terms">
                                Terminos y Condiciones
                            </FormLabel>
                            <div className="flex flex-col gap-2">
                                <Select onValueChange={handleTermsChange}>
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

                                <Button type="button" variant="secondary" className="w-full justify-start">
                                    Plantillas de Términos y condiciones
                                </Button>
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="requiredAvailability"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base">
                                        Disponibilidad Requerida
                                    </FormLabel>
                                    <FormDescription>
                                        Qué disponibilidad se requiere para realizar el servicio. Se mostrará en el punto 3 de los términos y condiciones.
                                    </FormDescription>
                                    <FormControl>
                                        <Input placeholder="Disponibilidad Requerida" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="serviceTime"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base">
                                        Hora del servicio
                                    </FormLabel>
                                    <FormDescription>
                                        A qué hora se realizará el servicio. Se mostrará en el punto 5 de los términos y condiciones.
                                    </FormDescription>
                                    <FormControl>
                                        <Input placeholder="Tiempo de Servicio" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="customField6"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base">
                                        Campo Personalizado 6
                                    </FormLabel>
                                    <FormDescription>
                                        Punto 6 de los términos y condiciones.
                                    </FormDescription>
                                    <FormControl>
                                        <Input placeholder="Campo Personalizado 6" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="deliverables"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base">
                                        Entregables
                                    </FormLabel>
                                    <FormDescription>
                                        Qué se entregará al cliente. Se mostrará en el punto 8 de los términos y condiciones.
                                    </FormDescription>
                                    <FormControl>
                                        <Input placeholder="Entregables" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="customField10"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base">
                                        Campo Personalizado 10
                                    </FormLabel>
                                    <FormDescription>
                                        Punto 10 de los términos y condiciones.
                                    </FormDescription>
                                    <FormControl>
                                        <Input placeholder="Campo Personalizado 10" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <SheetFooter>
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                            Guardar
                        </Button>
                    </SheetFooter>
                </form>
            </Form>
        </div>
    );
}

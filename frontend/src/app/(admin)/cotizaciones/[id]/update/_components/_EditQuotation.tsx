"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useState } from "react";
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

type Quotation = components["schemas"]["Quotation3"];
type TermsAndConditions = components["schemas"]["TermsAndConditions"];
type Clients = components["schemas"]["Client"]
type Services = components["schemas"]["Service"]

export default function EditQuotation({
    quotation,
    termsAndConditions,
    clients,
    services,
}: {
    quotation: Quotation,
    termsAndConditions: Array<TermsAndConditions>,
    clients: Array<Clients>,
    services: Array<Services>
})
{
    const [termsOpen, setTermsOpen] = useState(false);
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

    //const { setValue } = form;

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

    const handleTermsChange = async(id: string) =>
    {
        const result = await GetTermsAndConditionsById(id);
        if (result)
        {
            //const content = result[0].content;
            //setValue("termsAndConditions", content);
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

                                    {/* Servicios */}
                                    <FormField
                                        control={form.control}
                                        name="serviceIds"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-medium">
                                                    Servicios
                                                </FormLabel>
                                                <div className="space-y-2 border p-3 rounded-md">
                                                    {services.map((service) => (
                                                        <FormItem
                                                            key={service.id}
                                                            className="flex flex-row items-start space-x-3 space-y-0"
                                                        >
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value?.includes(service.id!)}
                                                                    onCheckedChange={(checked) =>
                                                                    {
                                                                        if (checked)
                                                                        {
                                                                            field.onChange([...field.value, service.id]);
                                                                        }
                                                                        else
                                                                        {
                                                                            field.onChange(field.value?.filter((value) => value !== service.id));
                                                                        }
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="text-sm font-normal">
                                                                {service.name}
                                                            </FormLabel>
                                                        </FormItem>
                                                    ))}
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
                                        name="serviceAddress"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-medium">
                                                    Dirección del servicio
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Dirección donde se realizará el servicio" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

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
                                        name="requiredAvailability"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-medium">
                                                    Disponibilidad requerida
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Disponibilidad necesaria" {...field} />
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
                                                <FormLabel className="text-base font-medium">
                                                    Tiempo de servicio
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Duración del servicio" {...field} />
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

                                    <FormField
                                        control={form.control}
                                        name="deliverables"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-medium">
                                                    Entregables
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Documentos o reportes a entregar"
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
                                        name="others"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-medium">
                                                    Otros
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Información adicional"
                                                        className="min-h-[100px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="space-y-2">
                                        <FormLabel htmlFor="terms" className="text-base font-medium">
                                            Términos y Condiciones
                                        </FormLabel>
                                        <div className="flex flex-col gap-2">
                                            <Select onValueChange={handleTermsChange}>
                                                <SelectTrigger className="border rounded-md">
                                                    <SelectValue placeholder="Seleccione una plantilla" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {
                                                            termsAndConditions.map((terms) => (
                                                                <SelectItem key={terms.id} value={terms.id ?? ""}>
                                                                    {terms.name}
                                                                </SelectItem>
                                                            ))
                                                        }
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>

                                            <Button type="button" variant="outline" onClick={() => setTermsOpen(true)} className="w-full justify-start">
                                                Ver plantillas de T&C
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-2">
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
                    termsAndConditions={termsAndConditions}
                />
            )}
        </>
    );
}

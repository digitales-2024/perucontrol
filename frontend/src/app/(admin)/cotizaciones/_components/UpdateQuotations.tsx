import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateQuotationSchema, quotationSchema } from "../schemas";
import { toast } from "sonner";
import { GetTermsAndConditionsById, UpdateQuotation } from "../actions";
import { AutoComplete, Option } from "@/components/ui/autocomplete";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import TermsAndConditions from "../_termsAndConditions/TermsAndConditions";
import { components } from "@/types/api";

type Quotation = components["schemas"]["Quotation2"];
type TermsAndConditions = components["schemas"]["TermsAndConditions"];
type Clients = components["schemas"]["ClientGetDTO"]
type Services = components["schemas"]["Service"]

export function UpdateQuotationSheet({ quotation, open, onOpenChange, termsAndConditions, clients, services }: { quotation: Quotation, open: boolean, onOpenChange: (open: boolean) => void, termsAndConditions: Array<TermsAndConditions>, clients: Array<Clients>, services: Array<Services> })
{
    const [termsOpen, setTermsOpen] = useState(false);

    const activeClients = clients.filter((client) => client.isActive);  // Filtrando los clientes activos

    { /* Creando las opciones para el AutoComplete */}
    const clientsOptions: Array<Option> =
    activeClients?.map((client) => ({
        value: client.id || "",
        label: client.razonSocial !== "-" ? client.razonSocial || "" : client.name || "",
    })) ?? [];

    const form = useForm<CreateQuotationSchema>({
        resolver: zodResolver(quotationSchema),
        defaultValues: {
            clientId: quotation?.client?.id || "",
            serviceIds: quotation?.services?.map((service) => service.id) || [],
            description: quotation?.description || "",
            area: quotation?.area || 0,
            spacesCount: quotation?.spacesCount || 0,
            hasTaxes: quotation?.hasTaxes || false,
            termsAndConditions: quotation?.termsAndConditions || "",
        },
    });

    const { reset, setValue } = form;

    useEffect(() =>
    {
        if (open)
        {
            form.reset({
                clientId: quotation?.client?.id || "",
                serviceIds: quotation?.services?.map((service) => service.id) || [],
                description: quotation?.description || "",
                area: quotation?.area || 0,
                spacesCount: quotation?.spacesCount || 0,
                hasTaxes: quotation?.hasTaxes || false,
                termsAndConditions: quotation?.termsAndConditions || "",
            });
        }
    }, [open, quotation, form]);

    const onSubmit = async(input: CreateQuotationSchema) =>
    {
        const result = UpdateQuotation(quotation.id!, input);
        toast.promise(result, {
            loading: "Cargando...",
            success: "¡Cotización actualizada exitosamente!",
            error: "Error",
        });

        reset();
        onOpenChange(false);
    };

    const handleTermsChange = async(id: string) =>
    {
        const result = await GetTermsAndConditionsById(id);
        if (result)
        {
            const content = result[0].content;
            setValue("termsAndConditions", content);
        }
        else
        {
            console.error("Error fetching terms and conditions:");
        }
    };

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle className="text-xl">
                            Nueva cotización
                        </SheetTitle>
                        <SheetDescription>
                            Agrega una nueva cotización.
                        </SheetDescription>
                    </SheetHeader>

                    <ScrollArea className="max-h-[85vh] h-full overflow-y-auto">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                                <div className="mx-4 grid gap-3">

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
                                                                field.value) || undefined
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

                                    {/* Servicios */}
                                    <FormField
                                        control={form.control}
                                        name="serviceIds"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base">
                                                    Servicios
                                                </FormLabel>
                                                <div className="space-y-2">
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

                                    {/* Descripción */}
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base">
                                                    Descripción
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Descripción del servicio..."
                                                        className="resize-none min-h-[80px] border rounded-md"
                                                        {...field}
                                                    />
                                                </FormControl>
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

                                    {/* IGV */}
                                    <div className="flex gap-2">
                                        <FormLabel className="text-base mt-1">
                                            IGV
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
                                                            termsAndConditions.map((terms) => (
                                                                <SelectItem key={terms.id} value={terms.id ? terms.id : ""}>
                                                                    {terms.name}
                                                                </SelectItem>
                                                            ))
                                                        }
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>

                                            <Button type="button" variant="secondary" onClick={() => setTermsOpen(true)} className="w-full justify-start">
                                                Plantillas de T&C
                                            </Button>

                                        </div>
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="termsAndConditions"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Terminos y Condiciones"
                                                        {...field}
                                                        className="min-h-[200px] border rounded-md"
                                                    />
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
                    </ScrollArea>
                </SheetContent>
            </Sheet>
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

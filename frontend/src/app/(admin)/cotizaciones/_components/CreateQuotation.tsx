import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GetTermsAndConditionsById, RegisterQuotation } from "../actions";
import { CreateQuotationSchema, quotationSchema } from "../schemas";
import { toast } from "sonner";
import { AutoComplete, Option } from "@/components/ui/autocomplete";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import TermsAndConditions from "../terms&Conditions/TermsAndConditions";
import { useQuotationContext } from "../context/QuotationContext";

export function CreateQuotation()
{
    const { terms, clients, services } = useQuotationContext();
    const [termsOpen, setTermsOpen] = useState(false);
    const [open, setOpen] = useState(false);

    { /* Creando las opciones para el AutoComplete */}
    const clientsOptions: Array<Option> =
        clients?.map((client) => ({
            value: client.id || "",
            label: client.razonSocial !== "" ? client.razonSocial || "" : client.name || "",
        })) ?? [];

    /*     const servicesOptions: Array<Option> =
          services?.map((service) => ({
              value: service.id || "",
              label: service.name,
          })) ?? []; */

    const form = useForm<CreateQuotationSchema>({
        resolver: zodResolver(quotationSchema),
        defaultValues: {
            clientId: "",
            serviceId: [],
            description: "",
            area: 0,
            spacesCount: 0,
            hasTaxes: false,
            termsAndConditions: "",
        },
    });

    const { reset, setValue } = form;

    const onSubmit = async(input: CreateQuotationSchema) =>
    {
        const result = RegisterQuotation(input);
        toast.promise(result , {
            loading: "Cargando...",
            success: () =>
            {
                reset();
                setOpen(false);
                return "Cotización registrada exitosamente";
            },
            error: "Error",
        });
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
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button>
                        Nueva cotización
                    </Button>
                </SheetTrigger>
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
                                        render={({ field}) => (
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

                                    {/* Servicio */}
                                    <FormField
                                        control={form.control}
                                        name="serviceId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base">
                                                  Servicio
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
                                                            terms.map((terms) => (
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
                    termsAndConditions={terms}
                />
            )}
        </>
    );
}

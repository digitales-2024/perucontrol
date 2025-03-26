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
import { AutoComplete, Option } from "@/components/ui/autocomplete";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import TermsAndConditions from "../_termsAndConditions/TermsAndConditions";
import { useQuotationContext } from "../context/QuotationContext";
import { cn } from "@/lib/utils";
import { Bug, SprayCanIcon as Spray, Rat, Shield, Check, ShieldCheck, Plus } from "lucide-react";
import { toastWrapper } from "@/types/toasts";
import DatePicker from "@/components/ui/date-time-picker";
import { format, parse } from "date-fns";

// Mapa de iconos para servicios
const serviceIcons: Record<string, React.ReactNode> = {
    Desratización: <Rat className="h-3 w-3" />,
    Desinsectación: <Bug className="h-3 w-3" />,
    Fumigación: <Spray className="h-3 w-3" />,
    Desinfección: <Shield className="h-3 w-3" />,
    LimpiezaDeTanque: <ShieldCheck className="h-3 w-3" />,
};

export function CreateQuotation()
{
    const { terms, clients, services } = useQuotationContext();
    const [termsOpen, setTermsOpen] = useState(false);
    const [open, setOpen] = useState(false);

    const activeClients = clients.filter((client) => client.isActive);  // Filtrando los clientes activos

    { /* Creando las opciones para el AutoComplete */ }
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
            clientId: "",
            serviceIds: [],
            frequency: "Bimonthly",
            area: 0,
            spacesCount: 0,
            hasTaxes: false,
            termsAndConditions: "",
            creationDate: "",
            expirationDate: "",
        },
    });

    const { reset, setValue } = form;

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
        reset();
        setOpen(false);
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
                    <Button className="w-28 text-xs">
                        <Plus />
                        Crear Nuevo
                    </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md md:max-w-lg p-0 overflow-hidden">
                    <SheetHeader>
                        <SheetTitle className="text-xl">
                            Nueva cotización
                        </SheetTitle>
                        <SheetDescription>
                            Agrega una nueva cotización.
                        </SheetDescription>
                    </SheetHeader>

                    <ScrollArea className="h-[calc(95vh-100px)]">
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
                                                                <SelectItem key={terms.id} value={terms.id ?? ""}>
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

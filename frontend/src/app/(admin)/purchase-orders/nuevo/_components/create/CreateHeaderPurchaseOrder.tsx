import React, { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import {
    Building2,
    CreditCard,
    Clock,
    Calendar,
    Check,
    HandCoins,
    DollarSign,
    Coins,
    CalendarCheck,
} from "lucide-react";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CreatePurchaseOrderSchema } from "../../../_schemas/createPurchaseOrdesSchema";
import { GetActiveSuppliers } from "@/app/(admin)/suppliers/_actions/SupplierActions";
import { AutoComplete, Option } from "@/components/ui/autocomplete";
import DatePicker from "@/components/ui/date-time-picker";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { addDays, format, parse } from "date-fns";

const durationPresets = [7, 15, 30, 45, 60];

interface CreateHeaderPurchaseOrderProps {
	form: UseFormReturn<CreatePurchaseOrderSchema>;
	setDuration: (days: number) => void;
}

export default function CreateHeaderPurchaseOrder({
    form,
    setDuration,
}: CreateHeaderPurchaseOrderProps)
{
    const [supplierOptions, setSupplierOptions] = useState<Array<Option>>([]);
    const [loadingSuppliers, setLoadingSuppliers] = useState(false);

    useEffect(() =>
    {
        setLoadingSuppliers(true);
        GetActiveSuppliers().then(([data]) =>
        {
            if (data)
            {
                setSupplierOptions(data.map((s) => ({
                    value: s.id ?? "",
                    label: s.businessName ?? "Proveedor sin nombre",
                    rucNumber: s.rucNumber ?? "", // <-- Agrega el rucNumber aquí
                })));
            }
            setLoadingSuppliers(false);
        });
    }, []);

    const issueDate = form.watch("issueDate");
    const durationDays = form.watch("durationDays");

    // Calcular fecha de vencimiento automáticamente
    const calculateExpirationDate = (issueDate: string, days: number) =>
    {
        if (!issueDate || !days) return null;
        // Siempre parsea como local
        const issue = parse(issueDate, "yyyy-MM-dd", new Date());
        return addDays(issue, days);
    };

    const expirationDate = calculateExpirationDate(issueDate, durationDays);

    // Actualizar el campo de vencimiento automáticamente
    useEffect(() =>
    {
        if (expirationDate)
        {
            form.setValue("expirationDate", expirationDate.toISOString().slice(0, 10));
        }
        else
        {
            form.setValue("expirationDate", "");
        }
    }, [issueDate, durationDays, form, expirationDate]);

    const formatDate = (date: Date) => date.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center">
                <div className="w-1 h-12 bg-gradient-to-b from-primary/80 to-emerald-500 rounded-full mr-6" />
                <div>
                    <h2 className="text-gray-900">
                        INFORMACIÓN GENERAL
                    </h2>
                    <p className="text-gray-600">
                        Complete los datos básicos de la orden de compra
                    </p>
                </div>
            </div>

            {/* Enhanced Single Card */}
            <Card className="border border-gray-200">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 gap-2">
                        {/* Enhanced Supplier Section */}
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <div className="p-2 bg-primary rounded-lg mr-3">
                                    <Building2 className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="text-gray-900 uppercase font-medium">
                                    Proveedor
                                </h3>
                            </div>
                            <FormField
                                control={form.control}
                                name="supplierId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <AutoComplete
                                                options={supplierOptions}
                                                placeholder="Selecciona un proveedor"
                                                emptyMessage="No se encontraron proveedores"
                                                value={supplierOptions.find((option) => option.value ===
														field.value)}
                                                isLoading={loadingSuppliers}
                                                onValueChange={(option) => field.onChange(option?.value ?? "")
                                                }
                                                searchKeys={[
                                                    "label",
                                                    "rucNumber",
                                                ]}
                                                inputBordered
                                                renderOption={(
                                                    option,
                                                    isSelected,
                                                ) => (
                                                    <>
                                                        <Building2 className="w-4 h-4 text-blue-600 mr-2" />
                                                        <div className="flex flex-col text-left">
                                                            <span className="font-medium">
                                                                {option.label}
                                                            </span>
                                                            {option.rucNumber && (
                                                                <span className="text-xs text-gray-500">
                                                                    RUC:
                                                                    {" "}
                                                                    {
                                                                        option.rucNumber
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                        {isSelected && (
                                                            <Check className="w-4 ml-auto" />
                                                        )}
                                                    </>
                                                )}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Separator className="border-gray-100 my-4" />

                        {/* Enhanced Dates Section */}
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <div className="p-2 bg-primary rounded-lg mr-3">
                                    <Calendar className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="text-gray-900 uppercase font-medium">
                                    Fechas
                                </h3>
                            </div>
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="issueDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="uppercase font-medium text-gray-700">
                                                Emisión
                                            </FormLabel>
                                            <FormControl>
                                                <DatePicker
                                                    value={
                                                        field.value
                                                            ? parse(
                                                                field.value,
                                                                "yyyy-MM-dd",
                                                                new Date(),
															  )
                                                            : undefined
                                                    }
                                                    onChange={(date) =>
                                                    {
                                                        if (date)
                                                        {
                                                            const formattedDate =
																format(
																    date,
																    "yyyy-MM-dd",
																);
                                                            field.onChange(formattedDate);
                                                        }
                                                        else
                                                        {
                                                            field.onChange("");
                                                        }
                                                    }}
                                                    placeholder="Selecciona la fecha de emisión"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* Enhanced Duration Section */}
                                <div className="space-y-4">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-primary rounded-lg mr-3">
                                                <Clock className="w-4 h-4 text-white" />
                                            </div>
                                            <h3 className="text-gray-900 uppercase font-medium">
                                                DURACIÓN DE LA ORDEN
                                            </h3>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {durationPresets.map((days) => (
                                                <Button
                                                    key={days}
                                                    type="button"
                                                    onClick={() => setDuration(days)
                                                    }
                                                >
                                                    {days}
                                                    {" "}
                                                    días
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="durationDays"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        max="365"
                                                        placeholder="Días personalizados"
                                                        {...field}
                                                        onChange={(e) => field.onChange(Number.parseInt(
                                                            e.target
                                                                .value,
                                                            10,
                                                        ) || 0)
                                                        }
                                                    />
                                                </FormControl>
                                                <FormDescription className="text-gray-600 mt-2">
                                                    Entre 1 y 365 días
                                                    calendario
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                {/* Calculated Expiration Date Display */}
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-primary rounded-lg mr-3">
                                            <CalendarCheck className="w-4 h-4 text-white" />
                                        </div>
                                        <FormLabel className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                                            Vencimiento
                                        </FormLabel>
                                    </div>

                                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4">
                                        {expirationDate ? (
                                            <div className="space-y-2">
                                                <div className="font-medium text-gray-900">
                                                    {format(
                                                        expirationDate,
                                                        "dd/MM/yyyy",
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-600 capitalize">
                                                    {formatDate(expirationDate)}
                                                </div>
                                                <div className="flex items-center text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full w-fit">
                                                    <CalendarCheck className="w-3 h-3 mr-1" />
                                                    Calculado automáticamente
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-4">
                                                <CalendarCheck className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                <p className="text-gray-500 text-sm">
                                                    Selecciona la fecha de
                                                    emisión y duración para
                                                    calcular el vencimiento
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Hidden field for form submission */}
                                <FormField
                                    control={form.control}
                                    name="expirationDate"
                                    render={({ field }) => (
                                        <FormItem className="hidden">
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="hidden"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <Separator className="border-gray-100 my-4" />

                        <div className="space-y-4">
                            <div className="flex items-center">
                                <div className="p-2 bg-primary rounded-lg mr-3">
                                    <CreditCard className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="text-gray-900 uppercase font-medium">
                                    Pago
                                </h3>
                            </div>
                            <div className="space-y-5">
                                <FormField
                                    control={form.control}
                                    name="currency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-medium text-gray-700 uppercase tracking-wide">
                                                Moneda
                                            </FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecciona moneda" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem
                                                        value="PEN"
                                                        className="py-3 flex items-center gap-2 rounded-lg hover:bg-blue-50 data-[state=checked]:bg-blue-100"
                                                    >
                                                        <Coins className="w-4 h-4 text-blue-600" />
                                                        <span>
                                                            Soles (S/.)
                                                        </span>
                                                    </SelectItem>
                                                    <SelectItem
                                                        value="USD"
                                                        className="py-3 flex items-center gap-2 rounded-lg hover:bg-blue-50 data-[state=checked]:bg-blue-100"
                                                    >
                                                        <DollarSign className="w-4 h-4 text-green-600" />
                                                        <span>
                                                            Dólares (US$)
                                                        </span>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="paymentMethod"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                                                Método
                                            </FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecciona método" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem
                                                        value="TRANSFER"
                                                        className="py-3 flex items-center gap-2 rounded-lg hover:bg-blue-50 data-[state=checked]:bg-blue-100"
                                                    >
                                                        <CreditCard className="w-4 h-4 text-purple-600" />
                                                        <span>
                                                            Transferencia
                                                        </span>
                                                    </SelectItem>
                                                    <SelectItem
                                                        value="CASH"
                                                        className="py-3 flex items-center gap-2 rounded-lg hover:bg-blue-50 data-[state=checked]:bg-blue-100"
                                                    >
                                                        <HandCoins className="w-4 h-4 text-amber-600" />
                                                        <span>
                                                            Al Contado
                                                        </span>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

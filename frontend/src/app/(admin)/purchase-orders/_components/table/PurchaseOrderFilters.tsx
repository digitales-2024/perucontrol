"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Search, RotateCcw, Building2, Check } from "lucide-react";
import { AutoComplete, Option } from "@/components/ui/autocomplete";
import { GetActiveSuppliers } from "@/app/(admin)/suppliers/_actions/SupplierActions";
import { format, parse } from "date-fns";
import DatePicker from "@/components/ui/date-time-picker";

interface PurchaseOrderFiltersProps {
	currentFilters: {
		startDate?: string;
		endDate?: string;
		supplierId?: string;
		currency?: string;
		status?: string;
		paymentMethod?: string;
	};
	onClose: () => void;
}

export function PurchaseOrderFilters({
    currentFilters,
    onClose,
}: PurchaseOrderFiltersProps)
{
    const router = useRouter();
    const searchParams = useSearchParams();
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

    const [filters, setFilters] = useState({
        startDate: currentFilters.startDate ?? "",
        endDate: currentFilters.endDate ?? "",
        supplierId: currentFilters.supplierId ?? "",
        currency: currentFilters.currency ?? "",
        status: currentFilters.status ?? "",
        paymentMethod: currentFilters.paymentMethod ?? "",
        // Filtros adicionales para fechas rápidas
        quickDateFilter: "",
        month: "",
        year: new Date().getFullYear()
            .toString(),
    });

    // Generar opciones de años (últimos 5 años)
    const yearOptions = Array.from({ length: 5 }, (_, i) =>
    {
        const year = new Date().getFullYear() - i;
        return { value: year.toString(), label: year.toString() };
    });

    // Opciones de meses
    const monthOptions = [
        { value: "01", label: "Enero" },
        { value: "02", label: "Febrero" },
        { value: "03", label: "Marzo" },
        { value: "04", label: "Abril" },
        { value: "05", label: "Mayo" },
        { value: "06", label: "Junio" },
        { value: "07", label: "Julio" },
        { value: "08", label: "Agosto" },
        { value: "09", label: "Septiembre" },
        { value: "10", label: "Octubre" },
        { value: "11", label: "Noviembre" },
        { value: "12", label: "Diciembre" },
    ];

    // Opciones de filtros rápidos de fecha
    const quickDateOptions = [
        { value: "today", label: "Hoy" },
        { value: "yesterday", label: "Ayer" },
        { value: "this_week", label: "Esta semana" },
        { value: "last_week", label: "Semana pasada" },
        { value: "this_month", label: "Este mes" },
        { value: "last_month", label: "Mes pasado" },
        { value: "this_year", label: "Este año" },
    ];

    // Opciones de moneda actualizadas (solo PEN y USD según el backend)
    const currencyOptions = [
        { value: "0", label: "Soles (S/)" },
        { value: "1", label: "Dólares ($)" },
    ];

    // Opciones de método de pago
    const paymentMethodOptions = [
        { value: "0", label: "Transferencia" },
        { value: "1", label: "Efectivo" },
    ];

    // Manejar filtros rápidos de fecha
    const handleQuickDateFilter = (value: string) =>
    {
        const today = new Date();
        let startDate = "";
        let endDate = "";

        switch (value)
        {
        case "today":
            startDate = today.toISOString().split("T")[0];
            endDate = today.toISOString().split("T")[0];
            break;
        case "yesterday": {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            startDate = yesterday.toISOString().split("T")[0];
            endDate = yesterday.toISOString().split("T")[0];
            break;
        }
        case "this_week": {
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            startDate = startOfWeek.toISOString().split("T")[0];
            endDate = today.toISOString().split("T")[0];
            break;
        }
        case "last_week": {
            const lastWeekStart = new Date(today);
            lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
            const lastWeekEnd = new Date(lastWeekStart);
            lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
            startDate = lastWeekStart.toISOString().split("T")[0];
            endDate = lastWeekEnd.toISOString().split("T")[0];
            break;
        }
        case "this_month":
            startDate = new Date(today.getFullYear(), today.getMonth(), 1)
                .toISOString()
                .split("T")[0];
            endDate = today.toISOString().split("T")[0];
            break;
        case "last_month": {
            const lastMonth = new Date(
                today.getFullYear(),
                today.getMonth() - 1,
                1,
            );
            const lastMonthEnd = new Date(
                today.getFullYear(),
                today.getMonth(),
                0,
            );
            startDate = lastMonth.toISOString().split("T")[0];
            endDate = lastMonthEnd.toISOString().split("T")[0];
            break;
        }
        case "this_year":
            startDate = new Date(today.getFullYear(), 0, 1)
                .toISOString()
                .split("T")[0];
            endDate = today.toISOString().split("T")[0];
            break;
        }

        setFilters((prev) => ({
            ...prev,
            startDate,
            endDate,
            quickDateFilter: value,
        }));
    };

    // Manejar filtro por mes/año
    const handleMonthYearFilter = () =>
    {
        if (filters.month && filters.year)
        {
            const year = Number.parseInt(filters.year, 10);
            const month = Number.parseInt(filters.month, 10) - 1; // JavaScript months are 0-indexed

            const startDate = new Date(year, month, 1)
                .toISOString()
                .split("T")[0];
            const endDate = new Date(year, month + 1, 0)
                .toISOString()
                .split("T")[0];

            setFilters((prev) => ({
                ...prev,
                startDate,
                endDate,
                quickDateFilter: "",
            }));
        }
    };

    // Aplicar filtros
    const applyFilters = () =>
    {
        const params = new URLSearchParams(searchParams.toString());

        // Limpiar parámetros existentes
        params.delete("startDate");
        params.delete("endDate");
        params.delete("supplierId");
        params.delete("currency");
        params.delete("status");
        params.delete("paymentMethod");

        // Agregar nuevos parámetros si tienen valor
        if (filters.startDate) params.set("startDate", filters.startDate);
        if (filters.endDate) params.set("endDate", filters.endDate);
        if (filters.supplierId) params.set("supplierId", filters.supplierId);
        if (filters.currency) params.set("currency", filters.currency);
        if (filters.status) params.set("status", filters.status);
        if (filters.paymentMethod) params.set("paymentMethod", filters.paymentMethod);

        router.push(`/purchase-orders?${params.toString()}`);
        onClose();
    };

    // Limpiar filtros
    const clearFilters = () =>
    {
        setFilters({
            startDate: "",
            endDate: "",
            supplierId: "",
            currency: "",
            status: "",
            paymentMethod: "",
            quickDateFilter: "",
            month: "",
            year: new Date().getFullYear()
                .toString(),
        });
        router.push("/purchase-orders");
        onClose();
    };

    // Efecto para aplicar filtro de mes/año cuando cambian
    useEffect(() =>
    {
        if (filters.month && filters.year)
        {
            handleMonthYearFilter();
        }
    }, [filters.month, filters.year]);

    return (
        <Card className="mb-4 bg-transparent mt-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold">
                    Filtros de Búsqueda
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Filtros rápidos de fecha */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>
                            Filtros rápidos de fecha
                        </Label>
                        <Select
                            value={filters.quickDateFilter}
                            onValueChange={handleQuickDateFilter}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar período" />
                            </SelectTrigger>
                            <SelectContent>
                                {quickDateOptions.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Filtro por mes/año */}
                    <div className="space-y-2">
                        <Label>
                            Filtrar por mes/año
                        </Label>
                        <div className="flex gap-2">
                            <Select
                                value={filters.month}
                                onValueChange={(value) => setFilters((prev) => ({
                                    ...prev,
                                    month: value,
                                }))
                                }
                            >
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Mes" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[400px]">
                                    {monthOptions.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.year}
                                onValueChange={(value) => setFilters((prev) => ({
                                    ...prev,
                                    year: value,
                                }))
                                }
                            >
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Año" />
                                </SelectTrigger>
                                <SelectContent>
                                    {yearOptions.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Fechas específicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="startDate">
                            Fecha de inicio
                        </Label>
                        <DatePicker
                            value={
                                filters.startDate
                                    ? parse(
                                        filters.startDate,
                                        "yyyy-MM-dd",
                                        new Date(),
									  )
                                    : undefined
                            }
                            onChange={(date) =>
                            {
                                if (date)
                                {
                                    const formattedDate = format(
                                        date,
                                        "yyyy-MM-dd",
                                    );
                                    setFilters((prev) => ({
                                        ...prev,
                                        startDate: formattedDate,
                                        quickDateFilter: "",
                                    }));
                                }
                                else
                                {
                                    setFilters((prev) => ({
                                        ...prev,
                                        startDate: "",
                                        quickDateFilter: "",
                                    }));
                                }
                            }}
                            placeholder="Selecciona la fecha de inicio"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="endDate">
                            Fecha de fin
                        </Label>
                        <DatePicker
                            value={
                                filters.endDate
                                    ? parse(
                                        filters.endDate,
                                        "yyyy-MM-dd",
                                        new Date(),
									  )
                                    : undefined
                            }
                            onChange={(date) =>
                            {
                                if (date)
                                {
                                    const formattedDate = format(
                                        date,
                                        "yyyy-MM-dd",
                                    );
                                    setFilters((prev) => ({
                                        ...prev,
                                        endDate: formattedDate,
                                        quickDateFilter: "",
                                    }));
                                }
                                else
                                {
                                    setFilters((prev) => ({
                                        ...prev,
                                        endDate: "",
                                        quickDateFilter: "",
                                    }));
                                }
                            }}
                            placeholder="Selecciona la fecha de fin"
                        />
                    </div>
                </div>

                {/* Otros filtros */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>
                            Proveedor
                        </Label>
                        <AutoComplete
                            options={supplierOptions}
                            placeholder="Selecciona un proveedor"
                            emptyMessage="No se encontraron proveedores"
                            value={supplierOptions.find((option) => option.value === filters.supplierId)}
                            isLoading={loadingSuppliers}
                            onValueChange={(option) => setFilters((prev) => ({
                                ...prev,
                                supplierId: option?.value ?? "",
                            }))
                            }
                            searchKeys={["label", "rucNumber"]}
                            inputBordered
                            renderOption={(option, isSelected) => (
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
                                                {option.rucNumber}
                                            </span>
                                        )}
                                    </div>
                                    {isSelected && (
                                        <Check className="w-4 ml-auto" />
                                    )}
                                </>
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>
                            Moneda
                        </Label>
                        <Select
                            value={filters.currency}
                            onValueChange={(value) => setFilters((prev) => ({
                                ...prev,
                                currency: value,
                            }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar moneda" />
                            </SelectTrigger>
                            <SelectContent>
                                {currencyOptions.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>
                            Método de Pago
                        </Label>
                        <Select
                            value={filters.paymentMethod}
                            onValueChange={(value) => setFilters((prev) => ({
                                ...prev,
                                paymentMethod: value,
                            }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar método" />
                            </SelectTrigger>
                            <SelectContent>
                                {paymentMethodOptions.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={clearFilters}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Limpiar
                    </Button>
                    <Button onClick={applyFilters}>
                        <Search className="h-4 w-4 mr-2" />
                        Aplicar Filtros
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

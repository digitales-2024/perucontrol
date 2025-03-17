"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";

interface DatePickerProps {
value: Date | undefined;
onChange: (date: Date | undefined) => void;
iconColor?: string; // Nuevo prop opcional para el color del icono
}

export default function DatePicker({
    value,
    onChange,
    iconColor,
}: DatePickerProps)
{
    const [month, setMonth] = React.useState<number>(value ? value.getMonth() : new Date().getMonth());
    const [year, setYear] = React.useState<number>(value ? value.getFullYear() : new Date().getFullYear());

    const years = Array.from({ length: 21 }, (_, i) => year - 10 + i);
    const months = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
    ];

    const handleMonthChange = (value: string) =>
    {
        setMonth(parseInt(value, 10));
    };

    const handleYearChange = (value: string) =>
    {
        setYear(parseInt(value, 10));
    };

    return (
        <Popover modal>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !value && "text-muted-foreground",
                    )}
                    tabIndex={0}
                >
                    <CalendarIcon
                        className={`mr-2 h-4 w-4 ${iconColor ? `${iconColor}` : ""}`}
                    />
                    {value ? (
                        <span className="truncate text-ellipsis">
                            {format(value, "PPP", { locale: es })}
                        </span>
                    ) : (
                        <span className="truncate">
Selecciona una fecha
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-auto p-0"
                align="center"
                side="bottom"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <div className="flex items-center justify-between p-3">
                    <Select
                        value={month.toString()}
                        onValueChange={handleMonthChange}
                    >
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Mes" />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map((month, index) => (
                                <SelectItem
                                    key={month}
                                    value={index.toString()}
                                >
                                    {month}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={year.toString()}
                        onValueChange={handleYearChange}
                    >
                        <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Año" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="p-2">
                    <Calendar
                        mode="single"
                        selected={value}
                        onSelect={onChange}
                        month={new Date(year, month)}
                        onMonthChange={(newMonth) =>
                        {
                            setMonth(newMonth.getMonth());
                            setYear(newMonth.getFullYear());
                        }}
                        initialFocus
                        locale={es}
                        className="capitalize"
                    />
                </div>
            </PopoverContent>
        </Popover>
    );
}

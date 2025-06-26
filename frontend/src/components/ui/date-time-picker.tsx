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
import { useMediaQuery } from "@/hooks/use-media-query";

interface DatePickerProps {
	value: Date | undefined;
	onChange: (date: Date | undefined) => void;
	iconColor?: string;
	className?: string;
	placeholder?: string;
}

export default function DatePicker({
    value,
    onChange,
    iconColor,
    className,
    placeholder = "Selecciona una fecha",
}: DatePickerProps)
{
    const [month, setMonth] = React.useState<number>(value ? value.getMonth() : new Date().getMonth());
    const [year, setYear] = React.useState<number>(value ? value.getFullYear() : new Date().getFullYear());
    const isDesktop = useMediaQuery("(min-width: 1400px)");

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
        setMonth(Number.parseInt(value, 10));
    };

    const handleYearChange = (value: string) =>
    {
        setYear(Number.parseInt(value, 10));
    };

    return (
        <Popover modal>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal truncate",
                        !value && "text-muted-foreground",
                        className,
                    )}
                    tabIndex={0}
                >
                    <CalendarIcon
                        className={`mr-2 h-4 w-4 flex-shrink-0 ${
                            iconColor ? `${iconColor}` : ""
                        }`}
                    />
                    {value ? (
                        <span className="truncate text-ellipsis">
                            {format(value, isDesktop ? "PPP" : "dd/MM/yyyy", {
                                locale: es,
                            })}
                        </span>
                    ) : (
                        <span className="truncate">
                            {placeholder}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className={cn(
                    "p-0",
                    isDesktop
                        ? "w-auto"
                        : "w-[calc(100vw-2rem)] max-w-[350px] overflow-y-auto max-h-[300px]",
                )}
                align="center"
                side="bottom"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <div
                    className={cn(
                        "",
                        isDesktop
                            ? "flex items-center justify-between p-3 pb-0"
                            : "flex flex-row space-y-2 p-1 gap-2 pb-0",
                    )}
                >
                    <Select
                        value={month.toString()}
                        onValueChange={handleMonthChange}
                    >
                        <SelectTrigger
                            className={isDesktop ? "w-[140px]" : "w-full"}
                        >
                            <SelectValue placeholder="Mes" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
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
                        <SelectTrigger
                            className={isDesktop ? "w-[100px]" : "w-full"}
                        >
                            <SelectValue placeholder="Año" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                            {years.map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className={cn(isDesktop ? "p-2" : "p-1")}>
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
                        className={cn("capitalize", isDesktop ? "" : "text-sm px-0 flex justify-center")}
                        classNames={{
                            day_selected:
								"bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",

                            day_today: "bg-accent text-accent-foreground",
                            day: cn(
                                "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                                !isDesktop && "h-8 w-8",
                            ),

                            head_cell: cn(
                                "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                                !isDesktop && "w-7 text-[0.7rem]",
                            ),
                            cell: cn(
                                "h-7 w-8 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                !isDesktop && "h-7 w-7",
                            ),

                            nav_button: cn(
                                "[&:hover]:bg-accent [&:hover]:text-accent-foreground",
                                !isDesktop && "h-7 w-7",
                            ),
                            table: "border-collapse space-y-1",
                        }}
                    />
                </div>
                {!isDesktop && (
                    <div className="p-3 border-t">
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => onChange(undefined)}
                        >
                            Limpiar selección
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}

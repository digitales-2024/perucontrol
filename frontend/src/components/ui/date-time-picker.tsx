"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface DatePickerProps {
  value: Date | undefined
  onChange: (date: Date | undefined) => void
  iconColor?: string
  className?: string
  placeholder?: string
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
    const isMobile = useIsMobile();

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
                    <CalendarIcon className={`mr-2 h-4 w-4 flex-shrink-0 ${iconColor ? `${iconColor}` : ""}`} />
                    {value ? (
                        <span className="truncate text-ellipsis">
                            {format(value, isMobile ? "dd/MM/yyyy" : "PPP", { locale: es })}
                        </span>
                    ) : (
                        <span className="truncate">
                            {placeholder}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className={cn("p-0", isMobile ? "w-[calc(100vw-2rem)] max-w-[350px]" : "w-auto")}
                align="center"
                side="bottom"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <div className={cn("p-3", isMobile ? "flex flex-col space-y-2" : "flex items-center justify-between")}>
                    <Select value={month.toString()} onValueChange={handleMonthChange}>
                        <SelectTrigger className={isMobile ? "w-full" : "w-[140px]"}>
                            <SelectValue placeholder="Mes" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                            {months.map((month, index) => (
                                <SelectItem key={month} value={index.toString()}>
                                    {month}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={year.toString()} onValueChange={handleYearChange}>
                        <SelectTrigger className={isMobile ? "w-full" : "w-[100px]"}>
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
                        className={cn("capitalize", isMobile && "text-sm")}
                        classNames={{
                            // eslint-disable-next-line camelcase
                            day_selected:
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                            // eslint-disable-next-line camelcase
                            day_today: "bg-accent text-accent-foreground",
                            day: cn("h-9 w-9 p-0 font-normal aria-selected:opacity-100", isMobile && "h-8 w-8"),
                            // eslint-disable-next-line camelcase
                            head_cell: cn(
                                "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                                isMobile && "w-8 text-[0.7rem]",
                            ),
                            cell: cn(
                                "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                isMobile && "h-8 w-8",
                            ),
                            // eslint-disable-next-line camelcase
                            nav_button: cn("[&:hover]:bg-accent [&:hover]:text-accent-foreground", isMobile && "h-7 w-7"),
                            table: "border-collapse space-y-1",
                        }}
                    />
                </div>
                {isMobile && (
                    <div className="p-3 border-t">
                        <Button variant="outline" className="w-full" onClick={() => onChange(undefined)}>
              Limpiar selección
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}

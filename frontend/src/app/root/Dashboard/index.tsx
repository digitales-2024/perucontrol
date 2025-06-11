"use client";

import { Card } from "@/components/ui/card";
import { Activity, Calendar as CalendarIcon, Users } from "lucide-react";
import { ServiceChartCircle, ServiceChartCircleInput } from "./_ServiceChartCircle";
import { ServiceChartLine, ServiceChartLineInput } from "./_ServiceChartLine";
import { components } from "@/types/api";
import { serviceLabelToServiceName } from "./types";
import { ProfitChart, ProfitChartInput } from "./_ProfitChart";
import { QuotationChart, QuotationChartData } from "./_QuotationChart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { LoadDashboardData } from "../actions";
import { toast } from "sonner";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import { PenCurrencyIcon } from "@/components/PenCurrencyIcon";

type StatsData = components["schemas"]["StatsGet"]

interface MonthYear {
    month: number;
    year: number;
}

// Generate month options
const months = [
    { value: 0, label: "Enero" },
    { value: 1, label: "Febrero" },
    { value: 2, label: "Marzo" },
    { value: 3, label: "Abril" },
    { value: 4, label: "Mayo" },
    { value: 5, label: "Junio" },
    { value: 6, label: "Julio" },
    { value: 7, label: "Agosto" },
    { value: 8, label: "Septiembre" },
    { value: 9, label: "Octubre" },
    { value: 10, label: "Noviembre" },
    { value: 11, label: "Diciembre" },
];

// Generate year options (current year and previous 5 years)
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

export function Dashboard({ data: initialData }: { data: StatsData })
{
    const [data, setData] = useState<StatsData>(initialData);
    const [loading, setLoading] = useState(false);

    // Default to 6 months ago to current month
    const sixMonthsAgo = subMonths(new Date(), 6);
    const now = new Date();

    const [startMonthYear, setStartMonthYear] = useState<MonthYear>({
        month: sixMonthsAgo.getMonth(),
        year: sixMonthsAgo.getFullYear(),
    });

    const [endMonthYear, setEndMonthYear] = useState<MonthYear>({
        month: now.getMonth(),
        year: now.getFullYear(),
    });

    // load data when date range changes
    useEffect(() =>
    {
        (async() =>
        {
            setLoading(true);

            // Convert month/year to date range
            const fromDate = startOfMonth(new Date(startMonthYear.year, startMonthYear.month));
            const toDate = endOfMonth(new Date(endMonthYear.year, endMonthYear.month));

            const [data, err] = await LoadDashboardData(fromDate, toDate);
            setLoading(false);

            if (err)
            {
                console.log(err);
                toast.error("Error cargando estadística");
                return;
            }
            setData(data);
        })();
    }, [startMonthYear, endMonthYear]);

    const mappedData = Object.entries(data.monthlyServiceCount)
        .map(([month, value]): ServiceChartLineInput => ({
            month,
            value,
        }));

    const pieChartData = Object.entries(data.serviceCount).map(([service, value]): ServiceChartCircleInput => ({
        service: serviceLabelToServiceName(service),
        value,
    }));

    return (
        <div>
            <div className="flex flex-wrap gap-4 items-center justify-end mb-4">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">
                        Desde:
                    </span>
                    <Select
                        value={`${startMonthYear.month}`}
                        onValueChange={(value) => setStartMonthYear((prev) => ({ ...prev, month: parseInt(value, 10) }))}
                    >
                        <SelectTrigger className="w-24">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map((month) => (
                                <SelectItem key={month.value} value={`${month.value}`}>
                                    {month.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={`${startMonthYear.year}`}
                        onValueChange={(value) => setStartMonthYear((prev) => ({ ...prev, year: parseInt(value, 10) }))}
                    >
                        <SelectTrigger className="w-16">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((year) => (
                                <SelectItem key={year} value={`${year}`}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                        Hasta:
                    </span>
                    <Select
                        value={`${endMonthYear.month}`}
                        onValueChange={(value) => setEndMonthYear((prev) => ({ ...prev, month: parseInt(value, 10) }))}
                    >
                        <SelectTrigger className="w-24">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map((month) => (
                                <SelectItem key={month.value} value={`${month.value}`}>
                                    {month.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={`${endMonthYear.year}`}
                        onValueChange={(value) => setEndMonthYear((prev) => ({ ...prev, year: parseInt(value, 10) }))}
                    >
                        <SelectTrigger className="w-16">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((year) => (
                                <SelectItem key={year} value={`${year}`}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className={loading ? "animate-pulse" : ""}>
                {/*
                <TopMetrics />
                */}
                <Graphics1 chartData={data.monthlyProfit} quotationData={data.monthlyQuotations} />
                <Graphics2 chartData={mappedData} pieChartData={pieChartData} />
            </div>

            <hr />
        </div>
    );
}

export function TopMetrics()
{
    return (
        <div className="grid xl:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-2 my-2">
            <Card className="p-4">
                <h3>
                    Total de ingresos
                    <span className="float-right">
                        <PenCurrencyIcon width={26} height={26} />
                    </span>
                </h3>
                <p className="text-xl font-bold">
                    S/. 5,231.80
                </p>
                <p className="text-muted-foreground text-xs">
                    Total de ingresos registrados
                </p>
            </Card>
            <Card className="p-4">
                <h3>
                    Total de clientes
                    <span className="float-right">
                        <Users />
                    </span>
                </h3>
                <p className="text-xl font-bold">
                    23
                </p>
                <p className="text-muted-foreground text-xs">
                    Total de clientes registrados
                </p>
            </Card>
            <Card className="p-4">
                <h3>
                    Servicios completados
                    <span className="float-right">
                        <CalendarIcon />
                    </span>
                </h3>
                <p className="text-xl font-bold">
                    12
                </p>
                <p className="text-muted-foreground text-xs">
                    Servicios que se han realizado en el periodo
                </p>
            </Card>
            <Card className="p-4">
                <h3>
                    Servicios pendientes
                    <span className="float-right">
                        <Activity />
                    </span>
                </h3>
                <p className="text-xl font-bold">
                    5
                </p>
                <p className="text-muted-foreground text-xs">
                    Servicios por realizar en el periodo
                </p>
            </Card>
        </div>
    );
}

function Graphics1({ chartData, quotationData }: { chartData: StatsData["monthlyProfit"], quotationData: StatsData["monthlyQuotations"] })
{
    const profitData: ProfitChartInput = Object.entries(chartData).map(([month, value]) => ({
        month,
        value,
    }));

    const quotationDataMapped = Object.entries(quotationData).map(([month, { accepted, rejected }]): QuotationChartData => ({
        month,
        accepted: accepted!,
        rejected: rejected!,
    }));

    return (
        <div className="grid md:grid-cols-2 grid-cols-1 gap-2 my-2">
            <Card className="p-4">
                <h3>
                    Ingresos por mes
                    <span className="float-right">
                        <PenCurrencyIcon width={26} height={26} />
                    </span>
                </h3>
                <p className="text-muted-foreground text-xs">
                    Total de ingresos por mes
                </p>

                <ProfitChart data={profitData} />
            </Card>

            <Card className="p-4">
                <h3>
                    Cotizaciones Aceptadas vs Rechazadas
                </h3>
                <p className="text-muted-foreground text-xs">
                    Comparación de la cantidad de cotizaciones aceptadas y rechazadas por mes
                </p>

                <QuotationChart chartData={quotationDataMapped} />
            </Card>
        </div>
    );
}

function Graphics2({ chartData, pieChartData }: { chartData: Array<ServiceChartLineInput>, pieChartData: Array<ServiceChartCircleInput> })
{
    return (
        <div className="grid md:grid-cols-[2fr_1fr] grid-cols-1 gap-2 my-2">
            <Card className="p-4">
                <h3>
                    Servicios realizados por mes
                </h3>
                <p className="text-muted-foreground text-xs">
                    En el periodo seleccionado
                </p>

                <ServiceChartLine chartData={chartData} />
            </Card>

            <Card className="p-4">
                <h3>
                    Servicios más demandados
                </h3>
                <p className="text-muted-foreground text-xs">
                    En el periodo seleccionado
                </p>

                <ServiceChartCircle data={pieChartData} />
            </Card>
        </div>
    );
}

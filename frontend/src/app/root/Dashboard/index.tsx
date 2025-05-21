"use client";

import { Card } from "@/components/ui/card";
import { Activity, Calendar as CalendarIcon, DollarSign, Users } from "lucide-react";
import { ServiceChartCircle, ServiceChartCircleInput } from "./_ServiceChartCircle";
import { ServiceChartLine, ServiceChartLineInput } from "./_ServiceChartLine";
import { components } from "@/types/api";
import { serviceLabelToServiceName } from "./types";
import { ProfitChart, ProfitChartInput } from "./_ProfitChart";
import { QuotationChart, QuotationChartData } from "./_QuotationChart";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { LoadDashboardData } from "../actions";
import { toast } from "sonner";

type StatsData = components["schemas"]["StatsGet"]

export function Dashboard({ data: initialData }: { data: StatsData })
{
    const [data, setData] = useState<StatsData>(initialData);
    const [loading, setLoading] = useState(false);

    const [date, setDate] = useState<DateRange | undefined>({
        from: subMonths(new Date(), 3),
        to: new Date(),
    });

    // load data date range change
    useEffect(() =>
    {
        (async() =>
        {
            if (!date || !date.from || !date.to)
            {
                return;
            }

            setLoading(true);
            const [data, err] = await LoadDashboardData(date.from, date.to!);
            if (err)
            {
                console.log(err);
                toast.error("Error cargando estadística");
            }
            setData(data);
            setLoading(false);
        })();
    }, [date]);

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
            <Popover>
                <div className="text-right">
                    <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                                "w-[300px] justify-start text-left font-normal",
                                !date && "text-muted-foreground",
                            )}
                        >
                            <CalendarIcon />
                            {date?.from ? (
                                date.to ? (
                                    <>
                                        <span className="capitalize">
                                            {format(date.from, "LLL dd, y", {
                                                locale: es,
                                            })}
                                        </span>
                                        {" "}
                                        -
                                        {" "}
                                        <span className="capitalize">
                                            {format(date.to, "LLL dd, y", {
                                                locale: es,
                                            })}
                                        </span>
                                    </>
                                ) : (
                                    format(date.from, "LLL dd, y", {
                                        locale: es,
                                    })
                                )
                            ) : (
                                <span>
                                    Pick a date
                                </span>
                            )}
                        </Button>
                    </PopoverTrigger>
                </div>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>

            <div className={loading ? "animate-pulse" : ""}>
                <TopMetrics />
                <Graphics1 chartData={data.monthlyProfit} quotationData={data.monthlyQuotations} />
                <Graphics2 chartData={mappedData} pieChartData={pieChartData} />
            </div>

            <hr />
        </div>
    );
}

function TopMetrics()
{
    return (
        <div className="grid grid-cols-4 gap-2 my-2">
            <Card className="p-4">
                <h3>
                    Total de ingresos
                    <span className="float-right">
                        <DollarSign />
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
                    Servicios que se han realizado este mes
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
                    Servicios por realizar este mes
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
        <div className="grid grid-cols-2 gap-2 my-2">
            <Card className="p-4">
                <h3>
                    Ingresos por mes
                    <span className="float-right">
                        <DollarSign />
                    </span>
                </h3>
                <p className="text-muted-foreground text-xs">
                    Total de ingresos por cada mes
                </p>

                <ProfitChart data={profitData} />
            </Card>

            <Card className="p-4">
                <h3>
                    Cotizaciones Aceptadas vs Rechazadas
                </h3>
                <p className="text-muted-foreground text-xs">
                    Comparación de la cantidad de cotizaciones aceptadas y rechazadas
                </p>

                <QuotationChart chartData={quotationDataMapped} />
            </Card>
        </div>
    );
}

function Graphics2({ chartData, pieChartData }: { chartData: Array<ServiceChartLineInput>, pieChartData: Array<ServiceChartCircleInput> })
{
    return (
        <div className="grid grid-cols-[2fr_1fr] gap-2 my-2">
            <Card className="p-4">
                <h3>
                    Servicios realizados por mes
                </h3>
                <p className="text-muted-foreground text-xs">
                    Últimos seis meses
                </p>

                <ServiceChartLine chartData={chartData} />
            </Card>

            <Card className="p-4">
                <h3>
                    Servicios más demandados
                </h3>
                <p className="text-muted-foreground text-xs">
                    Últimos seis meses
                </p>

                <ServiceChartCircle data={pieChartData} />
            </Card>
        </div>
    );
}

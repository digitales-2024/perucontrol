"use client";

import { Card } from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Activity, Calendar, DollarSign, Users } from "lucide-react";
import { Bar, BarChart } from "recharts";
import { ServiceChartCircle, ServiceChartCircleInput } from "./_ServiceChartCircle";
import { ServiceChartLine, ServiceChartLineInput } from "./_ServiceChartLine";
import { components } from "@/types/api";

type StatsData = components["schemas"]["StatsGet"]

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "#2563eb",
    },
    mobile: {
        label: "Mobile",
        color: "#60a5fa",
    },
} satisfies ChartConfig;

const chartData = [
    { month: "January", desktop: 186, mobile: 80 },
    { month: "February", desktop: 305, mobile: 200 },
    { month: "March", desktop: 237, mobile: 120 },
    { month: "April", desktop: 73, mobile: 190 },
    { month: "May", desktop: 209, mobile: 130 },
    { month: "June", desktop: 214, mobile: 140 },
];

export function Dashboard({ data }: { data: StatsData })
{
    const mappedData = Object.entries(data.monthlyServiceCount)
        .map(([month, value]): ServiceChartLineInput => ({
            month,
            value,
        }));

    return (
        <div>
            Dashboard

            <TopMetrics />
            <Graphics1 />
            <Graphics2 chartData={mappedData} />

            <hr />
        </div>
    );
}

function TopMetrics()
{
    return (
        <div className="grid grid-cols-4 gap-2">
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
                        <Calendar />
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

function Graphics1()
{
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

                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <BarChart accessibilityLayer data={chartData}>
                        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
                        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </Card>

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

                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <BarChart accessibilityLayer data={chartData}>
                        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
                        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </Card>
        </div>
    );
}

function Graphics2({ chartData }: { chartData: Array<ServiceChartLineInput> })
{
    const chartDataCircle: Array<ServiceChartCircleInput> = [
        { service: "desratizacion", value: 275 },
        { service: "desinsectacion", value: 200 },
        { service: "fumigacion", value: 187 },
        { service: "desinfeccion", value: 90 },
        { service: "limpieza_tanque", value: 173 },
    ];

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
                    Último mes
                </p>

                <ServiceChartCircle data={chartDataCircle} />
            </Card>
        </div>
    );
}

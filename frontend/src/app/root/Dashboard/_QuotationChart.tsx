"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

export type QuotationChartData = {
    month: string
    accepted: number
    rejected: number
}

const chartConfig = {
    accepted: {
        label: "Aceptado",
        color: "hsl(var(--chart-1))",
    },
    rejected: {
        label: "Rechazado",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig;

export function QuotationChart({ chartData }: { chartData: Array<QuotationChartData> })
{
    return (
        <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar dataKey="accepted" fill="var(--color-accepted)" radius={4} />
                <Bar dataKey="rejected" fill="var(--color-rejected)" radius={4} />
            </BarChart>
        </ChartContainer>
    );
}

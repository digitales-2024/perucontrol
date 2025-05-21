"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
    value: {
        label: "Ingresos",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig;

export type ProfitChartInput = Array<{ month: string; value: number }>

export function ProfitChart({ data }: { data: ProfitChartInput })
{
    return (
        <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={data}>
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
                    content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="value" fill="var(--color-value)" radius={8} />
            </BarChart>
        </ChartContainer>
    );
}

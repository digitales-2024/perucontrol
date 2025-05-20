import { CartesianGrid, LabelList, Line, LineChart, XAxis } from "recharts";

import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

export type ServiceChartLineInput = & {
    month: string;
    value: number;
}

const chartConfig = {
    value: {
        label: "Cantidad",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig;

export function ServiceChartLine({ chartData }: { chartData: Array<ServiceChartLineInput> })
{
    return (
        <ChartContainer config={chartConfig}>
            <LineChart
                accessibilityLayer
                data={chartData}
                margin={{
                    top: 20,
                    left: 12,
                    right: 12,
                }}
            >
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                />
                <Line
                    dataKey="value"
                    type="natural"
                    stroke="var(--color-value)"
                    strokeWidth={2}
                    dot={{
                        fill: "var(--color-desktop)",
                    }}
                    activeDot={{
                        r: 6,
                    }}
                >
                    <LabelList
                        position="top"
                        offset={12}
                        className="fill-foreground"
                        fontSize={12}
                    />
                </Line>
            </LineChart>
        </ChartContainer>
    );
}

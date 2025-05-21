import { Pie, PieChart, Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";

import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { ServiceName } from "./types";

export type ServiceChartCircleInput = {
    service: ServiceName;
    value: number;
}

type TableData = ServiceChartCircleInput & {
    fill: string,
}

const chartConfig: Record<ServiceName, { label: string, color: string }> = {
    desratizacion: {
        label: "Desratización",
        color: "hsl(var(--chart-1))",
    },
    desinsectacion: {
        label: "Desinsectación",
        color: "hsl(var(--chart-2))",
    },
    fumigacion: {
        label: "Fumigación",
        color: "hsl(var(--chart-3))",
    },
    limpieza_tanque: {
        label: "Limpieza de Tanque",
        color: "hsl(var(--chart-4))",
    },
    desinfeccion: {
        label: "Desinfección",
        color: "hsl(var(--chart-5))",
    },
} satisfies ChartConfig;

export function ServiceChartCircle({ data }: { data: Array<ServiceChartCircleInput> })
{
    const tabledata: Array<TableData> = data.map((i) => ({ ...i, fill: `var(--color-${i.service})` }));

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">No hay datos disponibles</p>
            </div>
        );
    }

    return (
        <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
        >
            <PieChart>
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                    data={tabledata}
                    dataKey="value"
                    nameKey="service"
                    innerRadius={60}
                    strokeWidth={5}
                    activeIndex={0}
                    activeShape={({
                        outerRadius = 0,
                        ...props
                    }: PieSectorDataItem) => (
                        <Sector {...props} outerRadius={outerRadius + 10} />
                    )}
                />
            </PieChart>
        </ChartContainer>
    );
}

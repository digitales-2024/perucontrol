"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Calendar1, CircleUserRound, Hash, LandPlot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { components } from "@/types/api";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type ProjectSummary = components["schemas"]["ProjectSummary"]

export const columns: Array<ColumnDef<ProjectSummary>> = [
    {
        accessorKey: "createdAt",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-center w-full"
            >
                FECHA DE EMISIÓN
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;
            const formattedDate = row.original.createdAt
                ? format(new Date(row.original.createdAt), "yyyy-MM-dd")
                : "N/A";
            return (
                <span
                    className={`items-center flex justify-center uppercase text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}
                >
                    <Calendar1 className="mr-1" />
                    {formattedDate}
                </span>
            );
        },
    },
    {
        accessorKey: "orderNumber",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 text-black font-bold hover:bg-transparent text-xs md:text-sm text-center w-full"
            >
                # SERVICIO
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;
            return (
                <span
                    className={`items-center flex justify-center uppercase text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}
                >
                    <Hash className="mr-1" />
                    {row.original.projectNumber}
                </span>
            );
        },
    },
    {
        accessorKey: "client",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-center w-full"
            >
                CLIENTE
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;
            return (
                <span
                    className={`items-center flex justify-center uppercase text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}
                >
                    <CircleUserRound className="mr-1" />
                    {row.original.client?.name === "-" ? row.original.client.razonSocial : row.original.client?.name}
                </span>
            );
        },
    },
    {
        accessorKey: "area",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-center w-full"
            >
                ÁREA m2
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;
            return (
                <span
                    className={`items-center flex justify-center uppercase text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}
                >
                    <LandPlot className="mr-1" />
                    {row.original.area}
                </span>
            );
        },
    },
    {
        accessorKey: "spacesCount",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-center w-full"
            >
                NRO. DE AMBIENTES
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;
            return (
                <span
                    className={`items-center flex justify-center uppercase text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}
                >
                    <Hash className="mr-1" />
                    {row.original.spacesCount}
                </span>
            );
        },
    },
    {
        accessorKey: "price",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-center w-full"
            >
                PRECIO
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original?.isActive;
            return (
                <span className={`flex justify-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""
                }`}
                >
                    {row.original?.price.toLocaleString("es-PE", {
                        style: "currency",
                        currency: "PEN",
                    })}
                </span>
            );
        },
    },
    {
        accessorKey: "status",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-center w-full"
            >
                ESTADO
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;

            return (
                row.original?.status === "Pending" ? (
                    <Badge
                        variant={!isActive ? "deleted" : "default"}
                        className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full",
                            isActive ? "bg-blue-500 text-white" : "bg-red-300 text-red-800",
                        )}
                    >
                        Pendiente
                    </Badge>
                ) : row.original?.status === "Completed" ? (
                    <Badge
                        variant={!isActive ? "deleted" : "approved"}
                        className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full",
                            isActive ? "bg-green-500 text-white" : "bg-red-300 text-red-800",
                        )}
                    >
                        Completado
                    </Badge>
                ) : (
                    <Badge
                        variant={!isActive ? "deleted" : "destructive"}
                        className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full",
                            isActive ? "bg-red-500 text-white" : "bg-red-300 text-red-800",
                        )}
                    >
                        Rechazado
                    </Badge>
                )
            );
        },
    },
];

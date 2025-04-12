"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { components } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar1, CalendarX, CircleUserRound, CreditCard, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

export type Quotation = components["schemas"]["Quotation3"]

export const columns: Array<ColumnDef<Quotation>> = [
    {
        accessorKey: "createdAt",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-left w-full"
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
        accessorKey: "quotationNumber",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-left w-full"
            >
                SERIE/CORRELATIVO
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;
            return (
                <span
                    className={`items-center flex justify-center text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}
                >
                    <Hash className="mr-1" />
                    {row.original!.quotationNumber}
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
                className="p-0 text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-left w-full"
            >
                CLIENTE
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original!.isActive;
            const clientName =
                row.original?.client?.name === "-"
                    ? row.original.client.razonSocial
                    : row.original?.client?.name;
            return (
                <span
                    className={`items-center flex justify-center uppercase text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}
                >
                    <CircleUserRound className="mr-1" />
                    {clientName}
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
                className="p-0 text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-left w-full"
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
        accessorKey: "paymentMethod",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-left w-full"
            >
                MÉTODO DE PAGO
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original?.isActive;
            return (
                <span
                    className={`items-center flex justify-center text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}
                >
                    <CreditCard className="mr-1" />
                    {row.original?.paymentMethod}
                </span>
            );
        },
    },
    {
        accessorKey: "expirationDate",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-left w-full"
            >
                FECHA DE EXPIRACIÓN
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original?.isActive;
            const rawDate = row.original?.expirationDate;
            const formattedDate = rawDate
                ? new Intl.DateTimeFormat("es-ES", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                }).format(new Date(rawDate))
                : "Fecha no disponible";

            return (
                <span
                    className={`items-center flex justify-center text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}
                >
                    <CalendarX className="mr-1" />
                    {formattedDate}
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
                className="p-0 text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-left w-full"
            >
                ESTADO
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original?.isActive;

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
                ) : row.original?.status === "Approved" ? (
                    <Badge
                        variant={!isActive ? "deleted" : "approved"}
                        className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full",
                            isActive ? "bg-green-500 text-white" : "bg-red-300 text-red-800",
                        )}
                    >
                        Aprobado
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
    {
        accessorKey: "hasTaxes",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-left w-full"
            >
                IGV
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original?.isActive;
            return (
                <span
                    className={`items-center flex justify-center text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}
                >
                    {row.original?.hasTaxes
                        ? "SI"
                        : "NO"}
                </span>
            );
        },
    },
    {
        accessorKey: "state",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-left w-full"
            >
                ESTADO
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;
            return (
                <Badge
                    className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full",
                        isActive ? "bg-green-400 text-white" : "bg-red-300 text-red-800",
                    )}
                >
                    {isActive ? "Activo" : "Inactivo"}
                </Badge>
            );
        },
    },
];


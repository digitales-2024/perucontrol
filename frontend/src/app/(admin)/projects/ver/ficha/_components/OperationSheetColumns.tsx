"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { components } from "@/types/api";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar1, CircleUserRound, FileText, Hash, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ProjectOperationSheet = components["schemas"]["AppointmentGetDTO2"]

export const columns: Array<ColumnDef<ProjectOperationSheet>> = [
    {
        accessorKey: "appointmentNumber",
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
                    {row.original.appointmentNumber}
                </span>
            );
        },
    },
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
            const formattedDate = row.original.dueDate
                ? format(new Date(row.original.dueDate), "yyyy-MM-dd")
                : "N/A";
            return (
                <div className="flex flex-col">
                    <span className="font-medium flex items-center text-xs md:text-sm">
                        <Calendar1 className="mr-1" />
                        {formattedDate}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "clientName",
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
            const isActive = row.original.isActive;
            const client = row.original.client;
            return (
                <div className="flex flex-col items-center">
                    <div>
                        <span
                            className={`items-center flex justify-center text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}
                        >
                            <CircleUserRound className="mr-1" />
                            {client?.razonSocial && client.razonSocial.trim() !== "" && client.razonSocial !== "-"
                                ? client.razonSocial
                                : client?.name ?? "-"}
                        </span>
                        <span
                            className={`items-center flex justify-center text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}
                        >
                            <FileText className="mr-1" />
                            {client?.typeDocumentValue}
                        </span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "services",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-left w-full"
            >
                SERVICIOS
            </Button>
        ),
        cell: ({ row }) =>
        {
            const services = row.original.services;

            return (
                <div className="flex flex-col gap-1">
                    {services!.map((service, index) => (
                        <div key={index} className="flex items-start text-xs md:text-sm">
                            <Minus className="h-4 w-4 mr-1 text-gray-500 mt-0.5" />
                            <span>
                                {service.name ?? "No especificado"}
                            </span>
                        </div>
                    ))}
                </div>
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
                <Badge
                    variant={!isActive ? "deleted" : "destructive"}
                    className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full",
                        isActive ? "bg-green-500 text-white" : "bg-red-300 text-red-800",
                    )}
                >
                    Aprobado
                </Badge>
            );
        },
    },
];

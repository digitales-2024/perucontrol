"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Calendar1, Hash } from "lucide-react";
import { AppointmentForTable } from "./ProjectDetails";

export const columns: Array<ColumnDef<AppointmentForTable>> = [
    {
        accessorKey: "appointmentNumber",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-center w-full"
            >
                SERIE/CORRELATIVO
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;

            return (
                <div className={`items-center flex justify-center text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""
                }`}
                >
                    <Hash className="mr-1" />
                    {row.index + 1}
                </div>
            );
        },
    },
    {
        accessorKey: "dueDate",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 text-zinc-800 hover:text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-center transition-colors w-full"
            >
                FECHA PLANIFICADA
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;
            const rawDate = row.original?.dueDate;
            const formattedActualDate = rawDate
                ? new Intl.DateTimeFormat("es-ES", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                }).format(new Date(rawDate))
                : "Fecha no disponible";
            return (
                <div
                    className={`items-center flex justify-center text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}
                >
                    <Calendar1 className="mr-1" />
                    {formattedActualDate}
                </div>
            );
        },
    },
    {
        accessorKey: "actualDate",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 text-zinc-800 hover:text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-center transition-colors w-full"
            >
                FECHA REAL
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;
            const rawDate = row.original?.actualDate;
            const formattedActualDate = rawDate
                ? new Intl.DateTimeFormat("es-ES", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                }).format(new Date(rawDate))
                : "Pendiente";

            return (
                <div
                    className={`items-center flex justify-center text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}
                >
                    <Calendar1 className="mr-1" />
                    {formattedActualDate}
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
                className="p-0 text-zinc-800 hover:text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-center transition-colors w-full"
            >
                SERVICIOS
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;
            return (
                <ul
                    className={`text-xs md:text-sm text-center ${!isActive ? "line-through text-red-500" : ""}`}
                >
                    {row.original.services?.map((service, index) => (
                        <li key={index} className="list-disc list-inside">
                            {service.name}
                        </li>
                    ))}
                </ul>
            );
        },
    },
];

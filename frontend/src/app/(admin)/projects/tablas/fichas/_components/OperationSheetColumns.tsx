"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { components } from "@/types/api";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar1, CircleUserRound, Clock1, Ellipsis, Hash, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toastWrapper } from "@/types/toasts";
import { GenerateOperationSheetExcel, GenerateOperationSheetPDF } from "../../../actions";

export type OperationSheetProp = components["schemas"]["GetOperationSheetsForTableOutDto"]

export const columns: Array<ColumnDef<OperationSheetProp>> = [
    {
        accessorKey: "number",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-left w-full"
            >
                SERIE/CORRELATIVO
            </Button>
        ),
        cell: ({ row }) => (
            <span
                className={"items-center flex justify-center text-center text-xs md:text-sm"}
            >
                <Hash className="mr-1" />
                {row.original.number}
            </span>
        ),
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
        cell: ({ getValue }) => (
            <div className="flex flex-col items-center">
                <div>
                    <span
                        className={"items-center flex justify-center text-center text-xs md:text-sm"}
                    >
                        <CircleUserRound className="mr-1" />
                        {getValue() as string}
                    </span>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "actualDate",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-left w-full"
            >
                FECHA DEL SERVICIO
            </Button>
        ),
        cell: ({ row }) =>
        {
            const formattedDate = !!row.original.actualDate
                ? format(new Date(row.original.actualDate), "yyyy-MM-dd")
                : "No realizado";
            return (
                <div className="flex flex-col items-center">
                    <span className="font-medium flex items-center text-xs md:text-sm">
                        <Calendar1 className="mr-1" />
                        {formattedDate}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "enterLeaveTime",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-left w-full"
            >
                HORA DEL SERVICIO
            </Button>
        ),
        cell: ({ getValue }) => (
            <div className="flex flex-col items-center">
                <span className="font-medium flex items-center text-xs md:text-sm">
                    <Clock1 className="mr-1" />
                    {getValue() as string}
                </span>
            </div>
        ),
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
            const isFinished = row.original.status === "Completed";

            return (
                <div className="flex flex-col items-center">
                    <Badge
                        className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full",
                            isFinished ? "bg-green-500 text-white" : "bg-sky-200 text-sky-800",
                        )}
                    >
                        {isFinished ? "Terminado" : "Pendiente"}
                    </Badge>
                </div>
            );
        },
    },
    {
        id: "table-actions",
        header: () => (
            <div
                className="p-0 text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal w-full text-center"
            >
                ACCIONES
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex items-center justify-center gap-2">
                <button
                    className="cursor-pointer"
                    onClick={(ev) =>
                    {
                        ev.stopPropagation();
                        downloadExcel(row.original.appointmentId);
                    }}
                >
                    <Badge variant="excel">
                        Excel
                    </Badge>
                </button>
                <button onClick={(ev) =>
                {
                    ev.stopPropagation();
                    downloadPdf(row.original.appointmentId);
                }}
                >
                    <Badge variant="pdf">
                        PDF
                    </Badge>
                </button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            aria-label="Open menu"
                            variant="ghost"
                            className="flex py-0 data-[state=open]:bg-muted
                                    border border-blue-500 text-blue-500
                                    hover:text-blue-700 rounded-xl"
                        >
                            <Ellipsis />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem>
                            Ver
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            Enviar
                            <DropdownMenuShortcut>
                                <Send
                                    className="size-4"
                                    aria-hidden="true"
                                />
                            </DropdownMenuShortcut>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        ),
    },
];

async function downloadExcel(id: string)
{
    const [blob, err] = await toastWrapper(GenerateOperationSheetExcel(id), {
        loading: "Generando archivo",
        success: "Excel generado",
    });

    if (err)
    {
        return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cotizacion_${id}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
};

async function downloadPdf(id: string)
{
    const [blob, err] = await toastWrapper(GenerateOperationSheetPDF(id), {
        loading: "Generando archivo",
        success: "Excel generado",
    });

    if (err)
    {
        return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cotizacion_${id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
};

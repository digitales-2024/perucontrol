"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import { components } from "@/types/api";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar1, CircleUserRound, Ellipsis, Hash, Pencil } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toastWrapper } from "@/types/toasts";
import { GenerateCertificatePDF } from "../../../[id]/evento/[app_id]/certificado/actions";

export type GetCertificateForTableOutDto = components["schemas"]["GetCertificateForTableOutDto"]

export const certificateTableColumns: Array<ColumnDef<GetCertificateForTableOutDto>> = [
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
                    onClick={(ev) =>
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
                            onClick={(ev) => ev.stopPropagation()}
                        >
                            <Ellipsis />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end" className="w-40"
                        onClick={(ev) => ev.stopPropagation()}
                    >
                        <Link href={`/projects/${row.original.projectId}/evento/${row.original.appointmentId}/ficha`}>
                            <DropdownMenuItem >
                                Editar
                                <DropdownMenuShortcut>
                                    <Pencil
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                </DropdownMenuShortcut>
                            </DropdownMenuItem>
                        </Link>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        ),
    },
];

async function downloadPdf(id: string)
{
    const [blob, err] = await toastWrapper(GenerateCertificatePDF(id), {
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

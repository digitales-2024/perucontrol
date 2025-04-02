"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Ellipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { components } from "@/types/api";
import { useState } from "react";
import { ViewQuotationDetails } from "./ViewQuotationDetails";
import { DeleteQuotation } from "./DeleteQuotation";
import { Badge } from "@/components/ui/badge";
import { AlertDialogAcceptQuotation } from "./AcceptQuotation";
import { AlertDialogRejectQuotation } from "./RejectQuotation";
import Link from "next/link";
import { toastWrapper } from "@/types/toasts";
import { GenerateExcel, GeneratePdf } from "../actions";

export const columns: Array<ColumnDef<components["schemas"]["Quotation3"]>> = [
    {
        accessorKey: "quotationNumber",
        header: "Nro.",
        cell: ({ row }) => (
            <span className={`text-xs md:text-sm ${!row.original!.isActive ? "line-through text-red-500" : ""}`}>
                #
                {" "}
                {row.original!.quotationNumber}
            </span>
        ),
    },
    {
        accessorKey: "client",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 hover:bg-transparent text-sm md:text-base"
            >
                Cliente
                {column.getIsSorted() === "asc" ? (
                    <ArrowUp className="ml-1 h-4 w-4" />
                ) : column.getIsSorted() === "desc" ? (
                    <ArrowDown className="ml-1 h-4 w-4" />
                ) : (
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                )}
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
                <span className={`uppercase text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}>
                    {clientName}
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
                className="p-0 hover:bg-transparent text-sm md:text-base"
            >
                Área
                {column.getIsSorted() === "asc" ? (
                    <ArrowUp className="ml-1 h-4 w-4" />
                ) : column.getIsSorted() === "desc" ? (
                    <ArrowDown className="ml-1 h-4 w-4" />
                ) : (
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                )}
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original?.isActive;
            return (
                <span className={`flex justify-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""
                }`}
                >
                    {row.original?.area}
                    {" "}
                    m2
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
                className="p-0 hover:bg-transparent text-sm md:text-base"
            >
                Ambientes
                {column.getIsSorted() === "asc" ? (
                    <ArrowUp className="ml-1 h-4 w-4" />
                ) : column.getIsSorted() === "desc" ? (
                    <ArrowDown className="ml-1 h-4 w-4" />
                ) : (
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                )}
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original?.isActive;
            return (
                <span className={`flex justify-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""
                }`}
                >
                    {row.original?.spacesCount}
                </span>
            );
        },
    },
    {
        accessorKey: "creationDate",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 hover:bg-transparent text-sm md:text-base"
            >
                Fecha
                {column.getIsSorted() === "asc" ? (
                    <ArrowUp className="ml-1 h-4 w-4" />
                ) : column.getIsSorted() === "desc" ? (
                    <ArrowDown className="ml-1 h-4 w-4" />
                ) : (
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                )}
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original?.isActive;
            const rawDate = row.original?.creationDate;
            const formattedDate = rawDate
                ? new Intl.DateTimeFormat("es-ES", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                }).format(new Date(rawDate))
                : "Fecha no disponible";

            return (
                <span className={`flex justify-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""
                }`}
                >
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
                className="p-0 hover:bg-transparent text-sm md:text-base"
            >
                Estado
                {column.getIsSorted() === "asc" ? (
                    <ArrowUp className="ml-1 h-4 w-4" />
                ) : column.getIsSorted() === "desc" ? (
                    <ArrowDown className="ml-1 h-4 w-4" />
                ) : (
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                )}
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original?.isActive;

            return (
                <span
                    className={`items-center text-center flex justify-center text-xs md:text-sm ${!isActive ? "text-red-500" : ""
                    }`}
                >
                    {row.original?.status === "Pending" ? (
                        <Badge variant={!isActive ? "deleted" : "default"}>
                            Pendiente
                        </Badge>
                    ) : row.original?.status === "Approved" ? (
                        <Badge variant={!isActive ? "deleted" : "approved"}>
                            Aprobado
                        </Badge>
                    ) : (
                        <Badge variant={!isActive ? "deleted" : "destructive"}>
                            Rechazado
                        </Badge>
                    )}
                </span>
            );
        },
    },
    {
        accessorKey: "hasTaxes",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 hover:bg-transparent text-sm md:text-base"
            >
                IGV
                {column.getIsSorted() === "asc" ? (
                    <ArrowUp className="ml-1 h-4 w-4" />
                ) : column.getIsSorted() === "desc" ? (
                    <ArrowDown className="ml-1 h-4 w-4" />
                ) : (
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                )}
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original?.isActive;
            return (
                <span className={`flex justify-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""
                }`}
                >
                    {row.original?.hasTaxes ? "SI" : "NO"}
                </span>
            );
        },
    },
    {
        id: "acciones",
        header: "Acciones",
        cell: function Cell({ row })
        {
            const isActive = row.original?.isActive;
            const [showDeleteQuotation, setShowDeleteQuotation] = useState(false);
            const [showDetailQuotation, setShowDetailQuotation] = useState(false);
            const [showAcceptQuotaion, setShowAcceptQuotaion] = useState(false);
            const [showRejectQuotaion, setShowRejectQuotaion] = useState(false);

            return (
                <div>
                    <div>
                        {/* Eliminar una cotización */}
                        <DeleteQuotation
                            open={showDeleteQuotation}
                            onOpenChange={setShowDeleteQuotation}
                            quotation={row.original!}
                            showTrigger={false}
                        />
                        {/* Ver Detalles de una cotización */}
                        <ViewQuotationDetails
                            open={showDetailQuotation}
                            onOpenChange={setShowDetailQuotation}
                            quotation={row.original}
                        />
                        {/* Acceptar Cotizacion */}
                        <AlertDialogAcceptQuotation
                            open={showAcceptQuotaion}
                            onOpenChange={setShowAcceptQuotaion}
                            quotation={row?.original}
                            showTrigger={false}
                            disabled={!isActive}
                        />
                        {/* Rechazar Cotización */}
                        <AlertDialogRejectQuotation
                            open={showRejectQuotaion}
                            onOpenChange={setShowRejectQuotaion}
                            quotation={row?.original}
                            showTrigger={false}
                            disabled={!isActive}
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                aria-label="Open menu"
                                variant="ghost"
                                className="flex size-8 p-0 data-[state=open]:bg-muted"
                            >
                                <Ellipsis
                                    className="size-4"
                                    aria-hidden="true"
                                />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>
                                Acciones
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onSelect={() => setShowAcceptQuotaion(true)}
                                disabled={!isActive}
                            >
                                Aceptar cotización
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => setShowRejectQuotaion(true)}
                                disabled={!isActive}
                            >
                                Rechazar cotización
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => setShowDetailQuotation(true)}>
                                Ver
                            </DropdownMenuItem>
                            <Link href={`/cotizaciones/${row.original!.id}`}>
                                <DropdownMenuItem
                                    disabled={!isActive}
                                >
                                    Editar
                                </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem
                                onSelect={() => downloadExcel(row.original!.id!)}
                                disabled={!isActive}
                            >
                                Descargar Cotización en Excel
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => downloadPdf(row.original!.id!)}
                                disabled={!isActive}
                            >
                                Descargar Cotización en PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => setShowDeleteQuotation(true)}
                                disabled={!isActive}
                            >
                                Eliminar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];

const downloadExcel = async(id: string) =>
{
    const [blob, err] = await toastWrapper(GenerateExcel(id), {
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

const downloadPdf = async(id: string) =>
{
    const [blob, err] = await toastWrapper(GeneratePdf(id), {
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

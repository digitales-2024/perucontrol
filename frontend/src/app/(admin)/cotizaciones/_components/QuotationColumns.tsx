"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Ellipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { components } from "@/types/api";
import { useState } from "react";
import { UpdateQuotationSheet } from "./UpdateQuotations";
import { useQuotationContext } from "../context/QuotationContext";
import { ViewQuotationDetails } from "./ViewQuotationDetails";
import { DeleteQuotation } from "./DeleteQuotation";
import { Badge } from "@/components/ui/badge";
import { AlertDialogAcceptQuotation } from "./AcceptQuotation";
import { AlertDialogRejectQuotation } from "./RejectQuotation";
import { QuotationDownload } from "./QuotationDownload";

export const columns: Array<ColumnDef<components["schemas"]["Quotation2"]>> = [
    {
        accessorKey: "client",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 hover:bg-transparent"
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
        cell: ({ row }) => (
            <span className="uppercase">
                {row.original?.client?.name === "-" ? row.original.client.razonSocial : row.original?.client?.name}
            </span>
        ),
    },
    {
        accessorKey: "frequency",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 hover:bg-transparent"
            >
                Frecuencia
                {column.getIsSorted() === "asc" ? (
                    <ArrowUp className="ml-1 h-4 w-4" />
                ) : column.getIsSorted() === "desc" ? (
                    <ArrowDown className="ml-1 h-4 w-4" />
                ) : (
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                )}
            </Button>
        ),
        cell: ({ row }) => (
            <span className="flex justify-center">
                {row.original?.frequency === "Bimonthly" ? "Bimestral"
                    : row.original?.frequency === "Quarterly" ? "Trimestral"
                        : "Semestral"}
            </span>
        ),
    },
    {
        accessorKey: "area",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 hover:bg-transparent"
            >
                Área m2
                {column.getIsSorted() === "asc" ? (
                    <ArrowUp className="ml-1 h-4 w-4" />
                ) : column.getIsSorted() === "desc" ? (
                    <ArrowDown className="ml-1 h-4 w-4" />
                ) : (
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                )}
            </Button>
        ),
        cell: ({ row }) => (
            <span className="flex justify-center">
                {row.original?.area}
            </span>
        ),
    },
    {
        accessorKey: "spacesCount",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 hover:bg-transparent"
            >
                Nro. de Ambientes
                {column.getIsSorted() === "asc" ? (
                    <ArrowUp className="ml-1 h-4 w-4" />
                ) : column.getIsSorted() === "desc" ? (
                    <ArrowDown className="ml-1 h-4 w-4" />
                ) : (
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                )}
            </Button>
        ),
        cell: ({ row }) => (
            <span className="flex justify-center">
                {row.original?.spacesCount}
            </span>
        ),
    },
    {
        accessorKey: "status",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 hover:bg-transparent"
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
        cell: ({ row }) => (
            <span className="items-center text-center flex justify-center">
                {row.original?.status === "Pending" ? (
                    <Badge variant="default">
                        Pendiente
                    </Badge>
                ) : row.original?.status === "Approved" ? (
                    <Badge variant="approved">
                        Aprobado
                    </Badge>
                ) : (
                    <Badge variant="destructive">
                        Rechazado
                    </Badge>
                )}
            </span>
        ),
    },
    {
        accessorKey: "hasTaxes",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 hover:bg-transparent"
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
        cell: ({ row }) => (
            <span className="items-center text-center flex justify-center">
                {row.original?.hasTaxes ? "SI" : "NO"}
            </span>
        ),
    },
    {
        id: "acciones",
        header: "Acciones",
        cell: function Cell({ row })
        {
            const [showUpdateQuotation, setShowUpdateQuotation] = useState(false);
            const [showDeleteQuotation, setShowDeleteQuotation] = useState(false);
            const [showDetailQuotation, setShowDetailQuotation] = useState(false);
            const [showAcceptQuotaion, setShowAcceptQuotaion] = useState(false);
            const [showRejectQuotaion, setShowRejectQuotaion] = useState(false);
            const [showDownload, setShowDownload] = useState(false);
            const { terms, clients, services } = useQuotationContext();

            return (
                <div>
                    <div>
                        {/* Actualizar cotización */}
                        <UpdateQuotationSheet
                            open={showUpdateQuotation}
                            onOpenChange={setShowUpdateQuotation}
                            quotation={row.original}
                            termsAndConditions={terms}
                            clients={clients}
                            services={services}
                        />
                        {/* Eliminar una cotización */}
                        <DeleteQuotation
                            open={showDeleteQuotation}
                            onOpenChange={setShowDeleteQuotation}
                            quotation={row?.original}
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
                        />
                        {/* Rechazar Cotización */}
                        <AlertDialogRejectQuotation
                            open={showRejectQuotaion}
                            onOpenChange={setShowRejectQuotaion}
                            quotation={row?.original}
                            showTrigger={false}
                        />
                        {/* Descargar Cotización */}
                        <QuotationDownload
                            open={showDownload}
                            onOpenChange={setShowDownload}
                            quotationId={row.original.id!}
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
                            <DropdownMenuItem onSelect={() => setShowAcceptQuotaion(true)}>
                                Aceptar cotización
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setShowRejectQuotaion(true)}>
                                Rechazar cotización
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => setShowDetailQuotation(true)}>
                                Ver
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setShowUpdateQuotation(true)}>
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setShowDownload(true)}>
                                Descargar Cotización
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setShowDeleteQuotation(true)}>
                                Eliminar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];

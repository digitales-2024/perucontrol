"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Ellipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { components } from "@/types/api";
import { useState } from "react";
import { UpdateQuotationSheet } from "./UpdateQuotations";
import { useQuotationContext } from "../context/QuotationContext";

export const columns: Array<ColumnDef<components["schemas"]["QuotationGetDTO"]>> = [
    {
        accessorKey: "typeDocument",
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
            <span className="items-center flex justify-center uppercase text-center">
                {row.original.client?.name === "-" ? row.original.client.razonSocial : row.original.client?.name }
            </span>
        ),
    },
    {
        accessorKey: "typeDocumentValue",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 hover:bg-transparent"
            >
              Descripción
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
            <span className="items-center flex justify-center text-center">
                {row.original.description}
            </span>
        ),
    },
    {
        accessorKey: "razonSocial",
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
                {row.original.area}
            </span>
        ),
    },
    {
        accessorKey: "businessType",
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
                {row.original.spacesCount}
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
                {row.original.hasTaxes ? "SI" : "NO"}
            </span>
        ),
    },
    {
        id: "acciones",
        header: "Acciones",
        cell: function Cell({ row })
        {
            const [showUpdateQuotation, setShowUpdateQuotation] = useState(false);
            // const [showDeleteClient, setShowDeleteClient] = useState(false);
            // const [showDetailClient, setShowDetailClient] = useState(false);
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
                        {/* <DeleteClient
                            open={showDeleteClient}
                            onOpenChange={setShowDeleteClient}
                            client={row.original}
                            showTrigger={false}
                        /> */}
                        {/* Ver Detalles de una cotización */}
                        {/* <ViewClientDetails
                            open={showDetailClient}
                            onOpenChange={setShowDetailClient}
                            client={row.original}
                            showTrigger={false}
                        /> */}
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
                            {/* <DropdownMenuItem onSelect={() => setShowDetailClient(true)}> */}
                            <DropdownMenuItem>
                                Ver
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setShowUpdateQuotation(true)}>
                                Editar
                            </DropdownMenuItem>
                            {/* <DropdownMenuItem onSelect={() => setShowDeleteClient(true)}> */}
                            <DropdownMenuItem>
                                Eliminar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];

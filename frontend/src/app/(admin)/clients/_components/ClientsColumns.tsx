"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Ellipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { CreateClientSchema } from "../schemas";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { useState } from "react";
import { UpdateClientSheet } from "./UpdateClients";
import { Client } from "../types/clients";

export const columns: ColumnDef<Client>[] = [
    {
        accessorKey: "typeDocument",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 hover:bg-transparent"
            >
        Tipo
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
                {row.original.typeDocument}
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
              Número de documento
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
                {row.original.typeDocumentValue}
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
        Razón Social
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
            <span className="items-center flex justify-center text-center capitalize">
                {row.original.razonSocial}
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
              Giro comercial
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
            <span className="items-center flex justify-center text-center uppercase">
                {row.original.businessType}
            </span>
        ),
    },
    {
        accessorKey: "name",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 hover:bg-transparent"
            >
            Nombre
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
            <span className="items-center text-center flex justify-center uppercase">
                {row.original.name}
            </span>
        ),
    },
    {
        accessorKey: "fiscalAddress",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 hover:bg-transparent"
            >
        Dirección fiscal
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
            <span className="items-center flex justify-center uppercase text-ellipsis text-center">
                {row.original.fiscalAddress}
            </span>
        ),
    },
    {
        id: "acciones",
        header: "Acciones",
        cell: function Cell({ row })
        {
            const [setshowUpdateClient, setSetshowUpdateClient] = useState(false);
            return (
                <div>
                    <div>
                        {/* Actualizar cliente */}
                        <UpdateClientSheet
                            open={setshowUpdateClient}
                            onOpenChange={setSetshowUpdateClient}
                            client={row.original}
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
                            <DropdownMenuItem>
                                Ver
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setSetshowUpdateClient(true)}>
                                Editar
                            </DropdownMenuItem>
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

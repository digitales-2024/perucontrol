"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Ellipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { useState } from "react";
import { UpdateClientSheet } from "./UpdateClients";
import { DeleteClient } from "./DeleteClient";
import { ViewClientDetails } from "./ViewClientsDetail";
import { components } from "@/types/api";

export const columns: Array<ColumnDef<components["schemas"]["Client"]>> = [
    {
        accessorKey: "typeDocument",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 hover:bg-transparent text-sm md:text-base"
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
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;
            return (
                <span className={`items-center flex justify-center uppercase text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}>
                    {row.original.typeDocument}
                </span>
            );
        },
    },
    {
        accessorKey: "typeDocumentValue",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 hover:bg-transparent text-sm md:text-base"
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
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;
            return (
                <span className={`items-center flex justify-center text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}>
                    {row.original.typeDocumentValue}
                </span>
            );
        },
    },
    {
        accessorKey: "razonSocial",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 hover:bg-transparent text-sm md:text-base"
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
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;
            return (
                <span className={`items-center flex justify-center text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}>
                    {row.original.razonSocial}
                </span>
            );
        },
    },
    {
        accessorKey: "name",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 hover:bg-transparent text-sm md:text-base"
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
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;
            return (
                <span className={`items-center flex justify-center text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}>
                    {row.original.name}
                </span>
            );
        },
    },
    {
        accessorKey: "contactName",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 hover:bg-transparent text-sm md:text-base"
            >
              Nombre de Contacto
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
            const isActive = row.original.isActive;
            return (
                <span className={`items-center flex justify-center text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}>
                    {row.original.contactName}
                </span>
            );
        },
    },
    {
        accessorKey: "email",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 hover:bg-transparent text-sm md:text-base"
            >
        Correo Electrónico
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
            const isActive = row.original.isActive;
            return (
                <span className={`items-center flex justify-center text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}>
                    {row.original.email}
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
            const [showUpdateClient, setShowUpdateClient] = useState(false);
            const [showDeleteClient, setShowDeleteClient] = useState(false);
            const [showDetailClient, setShowDetailClient] = useState(false);

            return (
                <div>
                    <div>
                        {/* Actualizar cliente */}
                        <UpdateClientSheet
                            open={showUpdateClient}
                            onOpenChange={setShowUpdateClient}
                            client={row.original}
                        />
                        {/* Eliminar un cliente */}
                        <DeleteClient
                            open={showDeleteClient}
                            onOpenChange={setShowDeleteClient}
                            client={row.original}
                            showTrigger={false}
                        />
                        {/* Ver Detalles de un cliente */}
                        <ViewClientDetails
                            open={showDetailClient}
                            onOpenChange={setShowDetailClient}
                            client={row.original}
                            showTrigger={false}
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
                            <DropdownMenuItem onSelect={() => setShowDetailClient(true)}>
                                Ver
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => setShowUpdateClient(true)}
                                disabled={!isActive}
                            >
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => setShowDeleteClient(true)}
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

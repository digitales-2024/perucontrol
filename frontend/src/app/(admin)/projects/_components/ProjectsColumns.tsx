"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Ellipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useState } from "react";
import { DeleteProject } from "./DeleteProject";
import { DownloadProject } from "./DownloadProject";
import { Project } from "../types";

export const columns: Array<ColumnDef<Project>> = [
    {
        accessorKey: "orderNumber",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 hover:bg-transparent text-sm md:text-base"
            >
        # Orden
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
                <span
                    className={`items-center flex justify-center uppercase text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}
                >
                    {row.original.orderNumber}
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
            const isActive = row.original.isActive;
            return (
                <span
                    className={`items-center flex justify-center uppercase text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}
                >
                    {row.original.client?.name === "-" ? row.original.client.razonSocial : row.original.client?.name}
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
            const isActive = row.original.isActive;

            return (
                <span
                    className={`items-center text-center flex justify-center text-xs md:text-sm ${
                        !isActive ? "text-red-500" : ""
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
        accessorKey: "area",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 hover:bg-transparent text-sm md:text-base"
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
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;
            return (
                <span className={`flex justify-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}>
                    {row.original.area}
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
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;
            return (
                <span
                    className={`items-center flex justify-center uppercase text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}
                >
                    {row.original.spacesCount}
                </span>
            );
        },
    },
    {
        accessorKey: "address",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 hover:bg-transparent text-sm md:text-base"
            >
        Dirección
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
                <span
                    className={`items-center flex justify-center uppercase text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}
                >
                    {row.original.address}
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
            const [showDeleteProject, setShowDeleteProject] = useState(false);
            const [showDownload, setShowDownload] = useState(false);

            const projectId = row.original.id;
            return (
                <div onClick={(e) => e.stopPropagation()}>
                    <div>
                        {/* Eliminar un proyecto */}
                        <DeleteProject
                            open={showDeleteProject}
                            onOpenChange={setShowDeleteProject}
                            project={row?.original}
                            showTrigger={false}
                        />
                        {/* Descargar Proyecto */}
                        <DownloadProject open={showDownload} onOpenChange={setShowDownload} project={row.original} />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button aria-label="Open menu" variant="ghost" className="flex size-8 p-0 data-[state=open]:bg-muted">
                                <Ellipsis className="size-4" aria-hidden="true" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>
                                Acciones
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <Link href={`/projects/${projectId}/details`}>
                                <DropdownMenuItem disabled={!isActive}>
                                    Ver Detalles
                                </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <Link href={`/projects/${projectId}/update/`}>
                                <DropdownMenuItem disabled={!isActive}>
                                    Editar
                                </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem onSelect={() => setShowDownload(true)} disabled={!isActive}>
                                Descargar Servicio
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setShowDeleteProject(true)} disabled={!isActive}>
                                Eliminar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];


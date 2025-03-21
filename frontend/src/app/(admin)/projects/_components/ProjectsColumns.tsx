"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, ChevronUp, Ellipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useState } from "react";
import { DeleteProject } from "./DeleteProject";
import { Project } from "../types";
import { AlertDialogAcceptProject } from "./AcceptProject";
import { AlertDialogRejectProject } from "./RejectProject";
import { DownloadProject } from "./DownloadProject";

export const columns: Array<ColumnDef<Project>> = [
    {
        accessorKey: "orderNumber",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 hover:bg-transparent"
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
                <span className={`items-center flex justify-center uppercase text-center ${!isActive ? "line-through text-red-500" : ""}`}>
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
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;
            return (
                <span className={`items-center flex justify-center uppercase text-center ${!isActive ? "line-through text-red-500" : ""}`}>
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
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;

            return (
                <span
                    className={`items-center text-center flex justify-center ${
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
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;
            return (
                <span className={`flex justify-center ${!isActive ? "line-through text-red-500" : ""}`}>
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
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;
            return (
                <span className={`items-center flex justify-center uppercase text-center ${!isActive ? "line-through text-red-500" : ""}`}>
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
                className="p-0 hover:bg-transparent"
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
                <span className={`items-center flex justify-center uppercase text-center ${!isActive ? "line-through text-red-500" : ""}`}>
                    {row.original.address}
                </span>
            );
        },
    },
    {
        id: "expander",
        header: () => null,
        cell: ({ row }) => (
            <Button variant="ghost" onClick={row.getToggleExpandedHandler()} className="p-0 hover:bg-transparent">
                {row.getIsExpanded() ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
        ),
    },
    {
        id: "acciones",
        header: "Acciones",
        cell: function Cell({ row })
        {
            const isActive = row.original?.isActive;
            const [showAcceptProject, setShowAcceptProject] = useState(false);
            const [showRejectProject, setShowRejectProject] = useState(false);
            const [showDeleteProject, setShowDeleteProject] = useState(false);
            const [showDownload, setShowDownload] = useState(false);

            const projectId = row.original.id;
            return (
                <div>
                    <div>
                        {/* Eliminar una cotización */}
                        <DeleteProject
                            open={showDeleteProject}
                            onOpenChange={setShowDeleteProject}
                            project={row?.original}
                            showTrigger={false}
                        />
                        {/* Acceptar Proyecto */}
                        <AlertDialogAcceptProject
                            open={showAcceptProject}
                            onOpenChange={setShowAcceptProject}
                            project={row?.original}
                            showTrigger={false}
                        />
                        {/* Rechazar Proyecto */}
                        <AlertDialogRejectProject
                            open={showRejectProject}
                            onOpenChange={setShowRejectProject}
                            project={row?.original}
                            showTrigger={false}
                        />
                        {/* Descargar Proyecto */}
                        <DownloadProject
                            open={showDownload}
                            onOpenChange={setShowDownload}
                            project={row.original}
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
                                onSelect={() => setShowAcceptProject(true)}
                                disabled={!isActive}
                            >
                                Aceptar Servicio
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => setShowRejectProject(true)}
                                disabled={!isActive}
                            >
                                Rechazar Servicio
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <Link href={`/projects/${projectId}/update/`}>
                                <DropdownMenuItem disabled={!isActive}>
                                    Editar
                                </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem
                                onSelect={() => setShowDownload(true)}
                                disabled={!isActive}
                            >
                                Descargar Servicio
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => setShowDeleteProject(true)}
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

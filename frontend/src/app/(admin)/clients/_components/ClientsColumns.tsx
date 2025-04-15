"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import type { components } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CircleUser, CircleUserRound, FileText, Hash, Mail, Phone } from "lucide-react";

export type Client = components["schemas"]["Client"]

export const columns: Array<ColumnDef<Client>> = [
    {
        accessorKey: "clientNumber",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-left w-full"
            >
                SERIE/CORRELATIVO
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;
            return (
                <span
                    className={`items-center flex justify-center text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}
                >
                    <Hash className="mr-1" />
                    {row.original.clientNumber}
                </span>
            );
        },
    },
    {
        accessorKey: "typeDocument",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-left w-full"
            >
                TIPO
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;
            return (
                <span
                    className={`items-center flex justify-center uppercase text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}
                >
                    <FileText className="mr-1" />
                    {row.original.typeDocument}
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
                className="p-0 text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-left w-full"
            >
                NOMBRE
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;
            const name = row.original.name;
            return (
                name !== "" && name !== "-" ? (
                    <div className={`flex items-center ${!isActive ? "line-through text-red-500" : ""}`}>
                        <CircleUserRound className="mr-1" />
                        <div>
                            <span
                                className={`items-center flex justify-center text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}
                            >
                                {row.original.name}
                            </span>
                            <span
                                className={`items-center flex justify-center text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}
                            >
                                {row.original.typeDocumentValue}
                            </span>

                        </div>
                    </div>
                ) : (
                    <span
                        className={`items-center flex justify-center text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}
                    >
                        -
                    </span>
                )
            );
        },
    },
    {
        accessorKey: "contactName",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-left w-full"
            >
                NOMBRE DE CONTACTO
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;
            const contactName = row.original.contactName;
            return (
                contactName !== "" && contactName !== "-" ? (
                    <div className={`flex items-center ${!isActive ? "line-through text-red-500" : ""}`}>
                        <CircleUser className="mr-1" />
                        <div>
                            <span
                                className={`items-center flex justify-center text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}
                            >
                                {row.original.contactName}
                            </span>
                            <span
                                className={`items-center flex justify-center text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}
                            >
                                {row.original.typeDocumentValue}
                            </span>
                        </div>
                    </div>
                ) : (
                    <span
                        className={`items-center flex justify-center text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}
                    >
                        -
                    </span>
                )
            );
        },
    },
    {
        accessorKey: "email",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-left w-full"
            >
                CORREO ELECTRÓNICO
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;
            return (
                <span
                    className={`items-center flex justify-center text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}
                >
                    <Mail className="mr-1" />
                    {row.original.email}
                </span>
            );
        },
    },
    {
        accessorKey: "phoneNumber",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-left w-full"
            >
                TÉLEFONO
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;
            return (
                <span
                    className={`items-center flex justify-center text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}
                >
                    <Phone className="mr-1" />
                    {row.original.phoneNumber}
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
                className="p-0 text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-left w-full"
            >
                ESTADO
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;
            return (
                <Badge
                    className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full",
                        isActive ? "bg-green-400 text-white" : "bg-red-300 text-red-800",
                    )}
                >
                    {isActive ? "Activo" : "Inactivo"}
                </Badge>
            );
        },
    },
];

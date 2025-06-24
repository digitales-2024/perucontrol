"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { CircleUser, CircleUserRound, Hash, Mail, Phone } from "lucide-react";
import { Supplier } from "../../_types/Suppliers";

export const columns: Array<ColumnDef<Supplier>> = [
    {
        accessorKey: "supplierNumber",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")
                }
                className="p-0 text-zinc-800 hover:text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-center transition-colors w-full"
            >
                SERIE
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;
            return (
                <div
                    className={`items-center flex justify-center text-center text-xs md:text-sm ${
                        !isActive ? "line-through text-red-500" : ""
                    }`}
                >
                    <Hash className="mr-1" />
                    {row.original.supplierNumber}
                </div>
            );
        },
    },
    {
        accessorKey: "name",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")
                }
                className="p-0 text-zinc-800 hover:text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-center transition-colors w-full"
            >
                NOMBRE
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;
            const inactiveClass = !isActive ? "line-through text-red-500" : "";
            const name = row.original.businessName ?? "-";

            return (
                <div
                    className={`grid grid-cols-[1rem_auto] gap-2 items-center ${inactiveClass}`}
                >
                    <CircleUserRound className="mr-1 shrink-0" />
                    <div>
                        <div
                            className={`items-center flex justify-center text-center text-xs md:text-sm ${inactiveClass}`}
                        >
                            {name}
                        </div>
                        <div
                            className={`items-center flex justify-center text-center text-xs md:text-sm ${inactiveClass}`}
                        >
                            <span className="capitalize">
                                RUC :&nbsp;
                            </span>
                            {row.original.rucNumber}
                        </div>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "contactName",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")
                }
                className="p-0 text-zinc-800 hover:text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-center transition-colors w-full"
            >
                NOMBRE DE CONTACTO
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;
            const contactName = row.original.contactName;
            return contactName !== "" && contactName !== "-" ? (
                <div
                    className={`flex items-center ${
                        !isActive ? "line-through text-red-500" : ""
                    }`}
                >
                    <CircleUser className="mr-1 shrink-0" />
                    <div>
                        <span
                            className={`items-center flex justify-center text-center text-xs md:text-sm ${
                                !isActive ? "line-through text-red-500" : ""
                            }`}
                        >
                            {row.original.contactName}
                        </span>
                        <span
                            className={`items-center flex justify-center text-center text-xs md:text-sm ${
                                !isActive ? "line-through text-red-500" : ""
                            }`}
                        >
                            {row.original.fiscalAddress || "-"}
                        </span>
                    </div>
                </div>
            ) : (
                <span
                    className={`items-center flex justify-center text-center text-xs md:text-sm ${
                        !isActive ? "line-through text-red-500" : ""
                    }`}
                >
                    -
                </span>
            );
        },
    },
    {
        accessorKey: "email",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")
                }
                className="p-0 text-zinc-800 hover:text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-center transition-colors w-full"
            >
                CORREO ELECTRÓNICO
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;
            return (
                <span
                    className={`items-center flex justify-center text-center text-xs md:text-sm ${
                        !isActive ? "line-through text-red-500" : ""
                    }`}
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
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")
                }
                className="p-0 text-zinc-800 hover:text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-center transition-colors w-full"
            >
                TELÉFONO
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;
            return (
                <span
                    className={`items-center flex justify-center text-center text-xs md:text-sm ${
                        !isActive ? "line-through text-red-500" : ""
                    }`}
                >
                    <Phone className="mr-1" />
                    {row.original.phoneNumber}
                </span>
            );
        },
    },
];

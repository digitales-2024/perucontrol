"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { formatInTimeZone } from "date-fns-tz";
import { Badge } from "@/components/ui/badge";
import { Calendar, Hash, Building2, Package } from "lucide-react";
import { PurchaseOrderCurrency, PurchaseOrderStatus, type PurchaseOrder } from "../../_types/PurchaseOrders";
const getStatusBadge = (status: PurchaseOrderStatus) =>
{
    const statusMap = {
        [PurchaseOrderStatus.Pending]: {
            label: "Pendiente",
            variant: "default" as const,
        },
        [PurchaseOrderStatus.Accepted]: {
            label: "Aceptada",
            variant: "default" as const,
        },
        [PurchaseOrderStatus.Cancelled]: {
            label: "Cancelada",
            variant: "destructive" as const,
        },
    };

    return (
        statusMap[status] || {
            label: "Desconocido",
            variant: "secondary" as const,
        }
    );
};

const getCurrencySymbol = (currency: PurchaseOrderCurrency) =>
{
    const currencyMap = {
        [PurchaseOrderCurrency.PEN]: "S/", // Soles peruanos
        [PurchaseOrderCurrency.USD]: "$", // Dólares
    };

    return currencyMap[currency] || "S/";
};

export const columns: Array<ColumnDef<PurchaseOrder>> = [
    {
        accessorKey: "number",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")
                }
                className="p-0 text-zinc-800 hover:text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-center transition-colors w-full"
            >
                N° ORDEN
            </Button>
        ),
        cell: ({ row }) => (
            <div className="items-center flex justify-center text-center text-xs md:text-sm font-medium">
                <Hash className="mr-1 h-4 w-4" />
                {row.original.number}
            </div>
        ),
    },
    {
        accessorKey: "supplier.businessName",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")
                }
                className="p-0 text-zinc-800 hover:text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-center transition-colors w-full"
            >
                PROVEEDOR
            </Button>
        ),
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <div className="flex items-center text-xs md:text-sm font-medium">
                    <Building2 className="mr-1 h-4 w-4 shrink-0" />
                    <span className="truncate">
                        {row.original.supplier?.businessName}
                    </span>
                </div>
                <div className="text-xs text-gray-500 ml-5">
                    RUC:
                    {" "}
                    {row.original.supplier?.rucNumber}
                </div>
            </div>
        ),
    },
    {
        accessorKey: "issueDate",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 text-zinc-800 hover:text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-center transition-colors w-full"
            >
                FECHA EMISIÓN
            </Button>
        ),
        cell: ({ row }) =>
        {
            const date = row.original.issueDate;
            // Formatea en UTC
            const formatted = formatInTimeZone(date, "UTC", "dd/MM/yyyy");
            return (
                <div className="flex items-center justify-center text-center text-xs md:text-sm">
                    <Calendar className="mr-1 h-4 w-4" />
                    {formatted}
                </div>
            );
        },
    },

    {
        accessorKey: "expirationDate",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 text-zinc-800 hover:text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-center transition-colors w-full"
            >
                FECHA DE VENCIMIENTO
            </Button>
        ),
        cell: ({ row }) =>
        {
            const date = row.original.expirationDate;
            // Formatea en UTC
            const formatted = formatInTimeZone(date, "UTC", "dd/MM/yyyy");
            return (
                <div className="flex items-center justify-center text-center text-xs md:text-sm">
                    <Calendar className="mr-1 h-4 w-4" />
                    {formatted}
                </div>
            );
        },
    },
    {
        accessorKey: "products",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")
                }
                className="p-0 text-zinc-800 hover:text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-center transition-colors w-full"
            >
                PRODUCTOS
            </Button>
        ),
        cell: ({ row }) =>
        {
            const productCount = row.original.products.length;
            const totalQuantity = row.original.products.reduce(
                (sum, product) => sum + product.quantity,
                0,
            );
            return (
                <div className="flex items-center justify-center text-center text-xs md:text-sm">
                    <Package className="mr-1 h-4 w-4" />
                    <div className="flex flex-col">
                        <span>
                            {productCount}
                            {" "}
                            producto
                            {productCount !== 1 ? "s" : ""}
                        </span>
                        <span className="text-xs text-gray-500">
                            {totalQuantity}
                            {" "}
                            unidades
                        </span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "total",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")
                }
                className="p-0 text-zinc-800 hover:text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-center transition-colors w-full"
            >
                TOTAL
            </Button>
        ),
        cell: ({ row }) =>
        {
            const total = row.original.total;
            const currency = getCurrencySymbol(row.original.currency);
            return (
                <div className="flex items-center justify-center text-center text-xs md:text-sm font-medium">
                    {currency}
                    {" "}
                    {total.toFixed(2)}
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")
                }
                className="p-0 text-zinc-800 hover:text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-center transition-colors w-full"
            >
                ESTADO
            </Button>
        ),
        cell: ({ row }) =>
        {
            const statusInfo = getStatusBadge(row.original.status);
            return (
                <div className="flex items-center justify-center text-center">
                    <Badge variant={statusInfo.variant} className="text-xs">
                        {statusInfo.label}
                    </Badge>
                </div>
            );
        },
    },
];

"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { BookPlus, CheckCheck, Pencil, Trash2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import  { type PurchaseOrder, PurchaseOrderStatus } from "../../_types/PurchaseOrders";
import { PurchaseOrderTable } from "@/components/data-table/PurchaseOrderDataTable";
import { PurchaseOrderFilters } from "./PurchaseOrderFilters";
import { useRouter } from "next/navigation";
import { PurchaseOrderViewDialog } from "../view/PurchaseOrderViewDialog";

interface DataTableProps<TData, TValue> {
	columns: Array<ColumnDef<TData, TValue>>;
	data: Array<TData>;
	currentFilters?: {
		startDate?: string;
		endDate?: string;
		supplierId?: string;
		currency?: string;
		status?: string;
	};
}

export function PurchaseOrdersDataTable<TData extends PurchaseOrder>({
    columns,
    data,
    currentFilters = {},
}: DataTableProps<TData, unknown>)
{
    const [showUpdateOrder, setShowUpdateOrder] = useState(false);
    const [showDeleteOrder, setShowDeleteOrder] = useState(false);
    const [showReactiveOrder, setShowReactiveOrder] = useState(false);
    const [showDetailOrder, setShowDetailOrder] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<TData | null>(null);

    const router = useRouter();

    // Contar órdenes por estado usando los enums correctos
    const getOrdersByStatus = (status: string) =>
    {
        if (status === "activo") return data.filter((order) => order.status !== PurchaseOrderStatus.Cancelled).length;
        if (status === "cancelado") return data.filter((order) => order.status === PurchaseOrderStatus.Cancelled).length;
        if (status === "pendiente") return data.filter((order) => order.status === PurchaseOrderStatus.Pending).length;
        if (status === "aceptado") return data.filter((order) => order.status === PurchaseOrderStatus.Accepted).length;
        return 0;
    };

    // Actualizar las opciones de estado
    const statusOptions = [
        {
            value: "activo",
            label: "Activas",
            count: getOrdersByStatus("activo"),
        },
        {
            value: "pendiente",
            label: "Pendientes",
            count: getOrdersByStatus("pendiente"),
        },
        {
            value: "aceptado",
            label: "Aceptadas",
            count: getOrdersByStatus("aceptado"),
        },
        {
            value: "cancelado",
            label: "Canceladas",
            count: getOrdersByStatus("cancelado"),
        },
    ];

    // Actualizar los botones de acción
    const actionButtons = [
        {
            label: "Editar",
            icon: <Pencil className="h-4 w-4" />,
            onClick: (row: PurchaseOrder) =>
            {
                router.push(`/purchase-orders/${row.id}/update`);
            },
            disabled: (row: TData) => row.status === PurchaseOrderStatus.Cancelled,
        },
        {
            label: "Cancelar",
            icon: <Trash2 className="h-4 w-4" />,
            onClick: (row: TData) =>
            {
                setSelectedOrder(row);
                setShowDeleteOrder(true);
            },
            disabled: (row: TData) => row.status === PurchaseOrderStatus.Cancelled, // Ya canceladas
        },
        {
            label: "Reactivar",
            icon: <CheckCheck className="h-4 w-4" />,
            onClick: (row: TData) =>
            {
                setSelectedOrder(row);
                setShowReactiveOrder(true);
            },
            disabled: (row: TData) => row.status !== PurchaseOrderStatus.Cancelled, // Solo canceladas
        },
    ];

    // Acciones de la barra de herramientas
    const toolbarActions = (
        <div className="flex flex-wrap sm:flex-row sm:items-center gap-2 ml-auto">
            <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
            >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
            </Button>
            <Link href="/purchase-orders/nuevo">
                <Button variant="default" size="sm">
                    <BookPlus className="h-4 w-4 mr-2" />
                    Nueva Orden de Compra
                </Button>
            </Link>
        </div>
    );

    // Actualizar la función de filtrado por estado
    const filterByStatus = (data: Array<TData>, status: string) =>
    {
        if (status === "activo") return data.filter((order) => order.status !== PurchaseOrderStatus.Cancelled &&
					order.isActive);
        if (status === "cancelado") return data.filter((order) => order.status === PurchaseOrderStatus.Cancelled);
        if (status === "pendiente") return data.filter((order) => order.status === PurchaseOrderStatus.Pending);
        if (status === "aceptado") return data.filter((order) => order.status === PurchaseOrderStatus.Accepted);
        return data;
    };

    return (
        <>
            {/* Modales */}
            {selectedOrder && (
                <PurchaseOrderViewDialog
                    open={showDetailOrder}
                    onOpenChange={setShowDetailOrder}
                    order={selectedOrder}
                />
            )}
            {showFilters && (
                <PurchaseOrderFilters
                    currentFilters={currentFilters}
                    onClose={() => setShowFilters(false)}
                />
            )}
            <PurchaseOrderTable
                columns={columns}
                data={data}
                statusOptions={statusOptions}
                statusField="status"
                statusFilter={filterByStatus}
                searchFields={[
                    "number",
                    "supplier.businessName",
                    "supplier.rucNumber",
                    "supplier.contactName",
                    "termsAndConditions",
                ]}
                actionButtons={actionButtons}
                onRowClick={(row) =>
                {
                    setSelectedOrder(row as TData);
                    setShowDetailOrder(true);
                }}
                toolbarActions={toolbarActions}
                emptyMessage="No hay órdenes de compra registradas"
            />
        </>
    );
}

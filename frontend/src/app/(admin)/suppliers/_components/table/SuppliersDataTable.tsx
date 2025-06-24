"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { BookPlus, CheckCheck, Pencil, Trash2 } from "lucide-react";
import { UpdateSupplierSheet } from "../_update/UpdateSuppliersSheet";
import { DeleteSupplier } from "../manage-status/DeleteSupplier";
import {  ViewSupplierDetails } from "../view/ViewSuppliersDetailDialog";
import { ExportCSVDialog } from "../_export/ExportCSVDialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Supplier } from "../../_types/Suppliers";
import { SupplierTable } from "@/components/data-table/SupplierDataTable";
import { ReactiveSupplierDialog } from "../manage-status/ReactiveSupplier";

interface DataTableProps<TData, TValue> {
    columns: Array<ColumnDef<TData, TValue>>
    data: Array<TData>
}

export function SuppliersDataTable<TData extends Supplier>({ columns, data }: DataTableProps<TData, unknown>)
{
    const [showUpdateClient, setShowUpdateClient] = useState(false);
    const [showDeleteClient, setShowDeleteClient] = useState(false);
    const [showReactiveClient, setShowReactiveClient] = useState(false);
    const [showDetailClient, setShowDetailClient] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<TData | null>(null);

    // Contar clientes por estado
    const getClientsByStatus = (status: string) =>
    {
        if (status === "activo") return data.filter((client) => client.isActive).length;
        if (status === "inactivo") return data.filter((client) => !client.isActive).length;
        return 0;
    };

    // Opciones de estado para las pestañas
    const statusOptions = [
        { value: "activo", label: "Activos", count: getClientsByStatus("activo") },
        { value: "inactivo", label: "Eliminados", count: getClientsByStatus("inactivo") },
    ];

    // Botones de acción para cada fila
    const actionButtons = [
        {
            label: "Editar",
            icon: <Pencil className="h-4 w-4" />,
            onClick: (row: TData) =>
            {
                setSelectedSupplier(row);
                setShowUpdateClient(true);
            },
            disabled: (row: TData) => !row.isActive,
        },
        {
            label: "Eliminar",
            icon: <Trash2 className="h-4 w-4" />,
            onClick: (row: TData) =>
            {
                setSelectedSupplier(row);
                setShowDeleteClient(true);
            },
            disabled: (row: TData) => !row.isActive,
        },
        {
            label: "Reactivar",
            icon: <CheckCheck className="h-4 w-4" />,
            onClick: (row: TData) =>
            {
                setSelectedSupplier(row);
                setShowReactiveClient(true);
            },
            disabled: (row: TData) => !row.isActive,
        },
    ];

    // Acciones de la barra de herramientas
    const toolbarActions = (
        <div className="flex flex-col sm:flex-row items-center gap-2 ml-auto">
            <ExportCSVDialog />
            <Link href="/suppliers/nuevo">
                <Button variant="default" size="sm">
                    <BookPlus className="h-4 w-4 mr-2" />
                    Nuevo proveedor
                </Button>
            </Link>
        </div>
    );

    // Función para filtrar por estado
    const filterByStatus = (data: Array<TData>, status: string) =>
    {
        if (status === "activo") return data.filter((client) => client.isActive);
        if (status === "inactivo") return data.filter((client) => !client.isActive);
        return data;
    };

    return (
        <>
            {/* Modales */}
            {selectedSupplier && (
                <>
                    <UpdateSupplierSheet
                        open={showUpdateClient}
                        onOpenChange={setShowUpdateClient}
                        supplier={selectedSupplier}
                    />
                    <DeleteSupplier
                        open={showDeleteClient}
                        onOpenChange={setShowDeleteClient}
                        supplier={selectedSupplier}
                        showTrigger={false}
                    />
                    <ReactiveSupplierDialog
                        open={showReactiveClient}
                        onOpenChange={setShowReactiveClient}
                        supplier={selectedSupplier}
                        showTrigger={false}
                    />
                    <ViewSupplierDetails
                        open={showDetailClient}
                        onOpenChange={setShowDetailClient}
                        supplier={selectedSupplier}
                        showTrigger={false}
                    />
                </>
            )}

            <SupplierTable
                columns={columns}
                data={data}
                statusOptions={statusOptions}
                statusField="isActive"
                statusFilter={filterByStatus}
                searchFields={[
                    "razonSocial",
                    "name",
                    "contactName",
                    "email",
                    "typeDocument",
                    "typeDocumentValue",
                ]}
                actionButtons={actionButtons}
                onRowClick={(row) =>
                {
                    setSelectedSupplier(row as TData);
                    setShowDetailClient(true);
                }}
                toolbarActions={toolbarActions}
                emptyMessage="No hay proveedores registrados"
            />
        </>
    );
}

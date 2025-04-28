"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ClientTable } from "@/components/data-table/ClientDataTable";
import { CheckCheck, Pencil, Trash2, UserPlus } from "lucide-react";
import { UpdateClientSheet } from "./UpdateClients";
import { DeleteClient } from "./DeleteClient";
import { ViewClientDetails } from "./ViewClientsDetail";
import type { Client } from "./ClientsColumns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ReactiveClient } from "./ReactiveClient";

interface DataTableProps<TData, TValue> {
    columns: Array<ColumnDef<TData, TValue>>
    data: Array<TData>
}

export function ClientsDataTable<TData extends Client>({ columns, data }: DataTableProps<TData, unknown>)
{
    const [showUpdateClient, setShowUpdateClient] = useState(false);
    const [showDeleteClient, setShowDeleteClient] = useState(false);
    const [showReactiveClient, setShowReactiveClient] = useState(false);
    const [showDetailClient, setShowDetailClient] = useState(false);
    const [selectedClient, setSelectedClient] = useState<TData | null>(null);

    // Contar clientes por estado
    const getClientsByStatus = (status: string) =>
    {
        if (status === "activo") return data.filter((client) => client.isActive).length;
        if (status === "inactivo") return data.filter((client) => !client.isActive).length;
        return 0;
    };

    // Contar clientes por tipo de documento
    const getClientsByDocumentType = (type: string) =>
    {
        if (type === "dni") return data.filter((client) => client.typeDocument === "dni" && client.isActive).length;
        if (type === "ruc") return data.filter((client) => client.typeDocument === "ruc" && client.isActive).length;
        return 0;
    };

    // Opciones de estado para las pestañas
    const statusOptions = [
        { value: "activo", label: "Activos", count: getClientsByStatus("activo") },
        { value: "inactivo", label: "Eliminados", count: getClientsByStatus("inactivo") },
        { value: "dni", label: "DNI", count: getClientsByDocumentType("dni") },
        { value: "ruc", label: "RUC", count: getClientsByDocumentType("ruc") },
    ];

    // Botones de acción para cada fila
    const actionButtons = [
        {
            label: "Editar",
            icon: <Pencil className="h-4 w-4" />,
            onClick: (row: TData) =>
            {
                setSelectedClient(row);
                setShowUpdateClient(true);
            },
            disabled: (row: TData) => !row.isActive,
        },
        {
            label: "Eliminar",
            icon: <Trash2 className="h-4 w-4" />,
            onClick: (row: TData) =>
            {
                setSelectedClient(row);
                setShowDeleteClient(true);
            },
            disabled: (row: TData) => !row.isActive,
        },
        {
            label: "Reactivar",
            icon: <CheckCheck className="h-4 w-4" />,
            onClick: (row: TData) =>
            {
                setSelectedClient(row);
                setShowReactiveClient(true);
            },
            disabled: (row: TData) => !row.isActive,
        },
    ];

    // Acciones de la barra de herramientas
    const toolbarActions = (
        <Link href="/clients/nuevo">
            <Button variant="default" size="sm" className="ml-auto">
                <UserPlus className="h-4 w-4 mr-2" />
                Nuevo cliente
            </Button>
        </Link>
    );

    // Función para filtrar por estado
    const filterByStatus = (data: Array<TData>, status: string) =>
    {
        if (status === "activo") return data.filter((client) => client.isActive);
        if (status === "inactivo") return data.filter((client) => !client.isActive);
        return data;
    };

    // Función para filtrar por tipo de documento
    const filterByDocumentType = (data: Array<TData>, type: string) =>
    {
        if (type === "dni") return data.filter((client) => client.isActive && client.typeDocument === "dni");
        if (type === "ruc") return data.filter((client) => client.isActive && client.typeDocument === "ruc");
        return data;
    };

    return (
        <>
            {/* Modales */}
            {selectedClient && (
                <>
                    <UpdateClientSheet
                        open={showUpdateClient}
                        onOpenChange={setShowUpdateClient}
                        client={selectedClient}
                    />
                    <DeleteClient
                        open={showDeleteClient}
                        onOpenChange={setShowDeleteClient}
                        client={selectedClient}
                        showTrigger={false}
                    />
                    <ReactiveClient
                        open={showReactiveClient}
                        onOpenChange={setShowReactiveClient}
                        client={selectedClient}
                        showTrigger={false}
                    />
                    <ViewClientDetails
                        open={showDetailClient}
                        onOpenChange={setShowDetailClient}
                        client={selectedClient}
                        showTrigger={false}
                    />
                </>
            )}

            <ClientTable
                columns={columns}
                data={data}
                statusOptions={statusOptions}
                statusField="isActive"
                statusFilter={filterByStatus}
                typeDocumentFilter={filterByDocumentType}
                searchFields={["razonSocial", "name", "contactName", "email", "typeDocument", "typeDocumentValue"]}
                actionButtons={actionButtons}
                onRowClick={(row) =>
                {
                    setSelectedClient(row as TData);
                    setShowDetailClient(true);
                }}
                toolbarActions={toolbarActions}
                emptyMessage="No hay clientes registrados"
            />
        </>
    );
}

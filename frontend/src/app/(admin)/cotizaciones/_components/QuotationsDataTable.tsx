"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { DeleteQuotation } from "./DeleteQuotation";
import { QuotationTable } from "@/components/data-table/QuotationDataTable";
import { AlertDialogAcceptQuotation } from "./AcceptQuotation";
import { AlertDialogRejectQuotation } from "./RejectQuotation";
import { useRouter } from "next/navigation";
import { toastWrapper } from "@/types/toasts";
import { GenerateExcel, GeneratePdf } from "../actions";
import type { Quotation } from "./QuotationColumns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface DataTableProps {
    columns: Array<ColumnDef<Quotation, unknown>>
    data: Array<Quotation>
}

export function QuotationDataTable({ columns, data }: DataTableProps)
{
    const [showDeleteQuotation, setShowDeleteQuotation] = useState(false);
    const [showAcceptQuotation, setShowAcceptQuotation] = useState(false);
    const [showRejectQuotation, setShowRejectQuotation] = useState(false);
    const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

    const router = useRouter();

    // Contar cotizaciones por estado
    const getQuotationByStatus = (status: string) =>
    {
        if (status === "todos") return data.length;
        if (status === "activo") return data.filter((quotation) => quotation.isActive).length;
        if (status === "inactivo") return data.filter((quotation) => !quotation.isActive).length;
        return 0;
    };

    // contar cotizaciones por igv
    const getQuotationByIgv = (igv: string) =>
    {
        if (igv === "con") return data.filter((quotation) => quotation.hasTaxes).length;
        if (igv === "sin") return data.filter((quotation) => !quotation.hasTaxes).length;
        return 0;
    };

    // contar cotizaciones por estado
    const getQuotationByState = (state: string) =>
    {
        if (state === "pendiente") return data.filter((quotation) => quotation.status === "Pending").length;
        if (state === "aprovado") return data.filter((quotation) => quotation.status === "Approved").length;
        if (state === "rechazado") return data.filter((quotation) => quotation.status === "Rejected").length;
        return 0;
    };

    // Opciones de estado para las pestañas
    const statusOptions = [
        { value: "todos", label: "Todos", count: getQuotationByStatus("todos") },
        { value: "con", label: "Con IGV", count: getQuotationByIgv("con") },
        { value: "sin", label: "Sin IGV", count: getQuotationByIgv("sin") },
        { value: "pendiente", label: "Pendiente", count: getQuotationByState("pendiente") },
        { value: "aprovado", label: "Aprobado", count: getQuotationByState("aprovado") },
        { value: "rechazado", label: "Rechazado", count: getQuotationByState("rechazado") },
        { value: "activo", label: "Activo", count: getQuotationByStatus("activo") },
        { value: "inactivo", label: "Inactivo", count: getQuotationByStatus("inactivo") },
    ];

    // Botones de acción para cada fila
    const actionButtons = [
        {
            label: "Editar",
            icon: <Pencil className="h-4 w-4" />,
            onClick: (row: Quotation) =>
            {
                router.push(`/cotizaciones/${row.id}/update`);
            },
            disabled: (row: Quotation) => !row.isActive,
        },
        {
            label: "Eliminar",
            icon: <Trash2 className="h-4 w-4" />,
            onClick: (row: Quotation) =>
            {
                setSelectedQuotation(row);
                setShowDeleteQuotation(true);
            },
            disabled: (row: Quotation) => !row.isActive,
        },
        {
            label: "Aceptar",
            icon: <Check className="h-4 w-4" />,
            onClick: (row: Quotation) =>
            {
                setSelectedQuotation(row);
                setShowAcceptQuotation(true);
            },
            disabled: (row: Quotation) => !row.isActive,
        },
        {
            label: "Rechazar",
            icon: <X className="h-4 w-4" />,
            onClick: (row: Quotation) =>
            {
                setSelectedQuotation(row);
                setShowRejectQuotation(true);
            },
            disabled: (row: Quotation) => !row.isActive,
        },
        {
            label: "Descargar",
            icon: (
                <Badge variant="excel">
                    Excel
                </Badge>),
            onClick: (row: Quotation) =>
            {
                downloadExcel(row.id!);
            },
            disabled: (row: Quotation) => !row.isActive,
        },
        {
            label: "Descargar",
            icon: (
                <Badge variant="pdf">
                    PDF
                </Badge>),
            onClick: (row: Quotation) =>
            {
                downloadPdf(row.id!);
            },
            disabled: (row: Quotation) => !row.isActive,
        },
    ];

    // Función para filtrar por estado
    const filterByStatus = (data: Array<Quotation>, status: string) =>
    {
        if (status === "todos") return data;
        if (status === "activo") return data.filter((quotation) => quotation.isActive);
        if (status === "inactivo") return data.filter((quotation) => !quotation.isActive);
        return data;
    };

    // Funcion para filtrar por igv
    const filterByIgv = (data: Array<Quotation>, igv: string) =>
    {
        if (igv === "con") return data.filter((quotation) => quotation.hasTaxes);
        if (igv === "sin") return data.filter((quotation) => !quotation.hasTaxes);
        return data;
    };

    // Funcion para filtrar por estado
    const filterByState = (data: Array<Quotation>, state: string) =>
    {
        if (state === "pendiente") return data.filter((quotation) => quotation.status === "Pending");
        if (state === "aprovado") return data.filter((quotation) => quotation.status === "Approved");
        if (state === "rechazado") return data.filter((quotation) => quotation.status === "Rejected");
        return data;
    };

    // Acciones de la barra de herramientas
    const toolbarActions = (
        <Link href="/cotizaciones/nuevo">
            <Button>
                <Plus />
                Crear cotización
            </Button>
        </Link>
    );

    return (
        <>
            {/* Modales */}
            {selectedQuotation && (
                <>
                    <DeleteQuotation
                        open={showDeleteQuotation}
                        onOpenChange={setShowDeleteQuotation}
                        quotation={selectedQuotation}
                        showTrigger={false}
                    />
                    {/* Acceptar Cotizacion */}
                    <AlertDialogAcceptQuotation
                        open={showAcceptQuotation}
                        onOpenChange={setShowAcceptQuotation}
                        quotation={selectedQuotation}
                        showTrigger={false}
                    />
                    {/* Rechazar Cotización */}
                    <AlertDialogRejectQuotation
                        open={showRejectQuotation}
                        onOpenChange={setShowRejectQuotation}
                        quotation={selectedQuotation}
                        showTrigger={false}
                    />
                </>
            )}

            <QuotationTable
                columns={columns}
                data={data}
                statusOptions={statusOptions}
                statusField="isActive"
                statusFilter={filterByStatus}
                igvFilter={filterByIgv}
                stateFilter={filterByState}
                searchFields={["clientName", "price", "paymentMethod", "expirationDate", "status", "hasTaxes"]}
                dateRangeField={{ field: "createdAt", format: "dd/MM/yyyy" }}
                actionButtons={actionButtons}
                onRowClick={(row) =>
                {
                    router.push(`/cotizaciones/${row.id}`);
                }}
                toolbarActions={toolbarActions}
                emptyMessage="No hay cotizaciones registradas"
            />
        </>
    );
}

const downloadExcel = async(id: string) =>
{
    const [blob, err] = await toastWrapper(GenerateExcel(id), {
        loading: "Generando archivo",
        success: "Excel generado",
    });

    if (err)
    {
        return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cotizacion_${id}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
};

const downloadPdf = async(id: string) =>
{
    const [blob, err] = await toastWrapper(GeneratePdf(id), {
        loading: "Generando archivo",
        success: "Excel generado",
    });

    if (err)
    {
        return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cotizacion_${id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
};

"use client";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
// import { ProjectsTableToolbarActions } from "./ProjectsTableToolbarActions";
import { Project } from "../types";
import { useRouter } from "next/navigation";
import { components } from "@/types/api";
import { ProjectTable } from "@/components/data-table/ProjectDataTable";

type ProjectSummary = components["schemas"]["ProjectSummary"]

interface DataTableProps {
    columns: Array<ColumnDef<ProjectSummary, unknown>>;
    data: Array<ProjectSummary>;
}

export function ProjectsDataTable({ columns, data }: DataTableProps)
{
    const [showDeleteQuotation, setShowDeleteQuotation] = useState(false);
    const [showAcceptQuotation, setShowAcceptQuotation] = useState(false);
    const [showRejectQuotation, setShowRejectQuotation] = useState(false);
    const [selectedQuotation, setSelectedQuotation] = useState<ProjectSummary | null>(null);

    // Contar cotizaciones por estado
    const getProjectByStatus = (status: string) =>
    {
        if (status === "todos") return data.length;
        if (status === "activo") return data.filter((quotation) => quotation.isActive).length;
        if (status === "inactivo") return data.filter((quotation) => !quotation.isActive).length;
        return 0;
    };

    const router = useRouter();

    return (
        <>
            {/* Modales */}
            {selectedQuotation && (
                <>
                    {/* <DeleteQuotation
                        open={showDeleteQuotation}
                        onOpenChange={setShowDeleteQuotation}
                        quotation={selectedQuotation}
                        showTrigger={false}
                    /> */}
                    {/* Acceptar Cotizacion */}
                    {/* <AlertDialogAcceptQuotation
                        open={showAcceptQuotation}
                        onOpenChange={setShowAcceptQuotation}
                        quotation={selectedQuotation}
                        showTrigger={false}
                    /> */}
                    {/* Rechazar Cotización */}
                    {/* <AlertDialogRejectQuotation
                        open={showRejectQuotation}
                        onOpenChange={setShowRejectQuotation}
                        quotation={selectedQuotation}
                        showTrigger={false}
                    /> */}
                </>
            )}
            <ProjectTable
                columns={columns}
                data={data}
                // statusOptions={statusOptions}
                statusField="isActive"
                // statusFilter={filterByStatus}
                // igvFilter={filterByIgv}
                // stateFilter={filterByState}
                searchFields={["clientName", "price", "paymentMethod", "expirationDate", "status","hasTaxes"]}
                dateRangeField={null} // No usamos filtro de fechas para clientes
                // actionButtons={actionButtons}
                onRowClick={(row) =>
                {
                    router.push(`/cotizaciones/${row.id}`);
                }}
                // toolbarActions={toolbarActions}
                emptyMessage="No hay cotizaciones registrados"
            />

        </>
    );
}

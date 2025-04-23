"use client";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { components } from "@/types/api";
import { ProjectTable } from "@/components/data-table/ProjectDataTable";
import { DeleteProject } from "./DeleteProject";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export type ProjectSummary = components["schemas"]["ProjectSummary"]

interface DataTableProps {
    columns: Array<ColumnDef<ProjectSummary, unknown>>;
    data: Array<ProjectSummary>;
}

export function ProjectsDataTable({ columns, data }: DataTableProps)
{
    const [showDeleteProject, setShowDeleteProject] = useState(false);
    const [selectedProject, setSelectedProject] = useState<ProjectSummary | null>(null);

    const router = useRouter();

    // Contar proyecto por estado
    const getProjectByStatus = (status: string) =>
    {
        if (status === "todos") return data.length;
        if (status === "activo") return data.filter((project) => project.isActive).length;
        if (status === "inactivo") return data.filter((project) => !project.isActive).length;
        return 0;
    };

    // contar proyectos por estado
    const getQuotationByState = (state: string) =>
    {
        if (state === "pendiente") return data.filter((project) => project.status === "Pending").length;
        if (state === "completado") return data.filter((project) => project.status === "Completed").length;
        if (state === "rechazado") return data.filter((project) => project.status === "Rejected").length;
        return 0;
    };

    // Opciones de estado para las pestañas
    const statusOptions = [
        { value: "todos", label: "Todos", count: getProjectByStatus("todos") },
        { value: "activo", label: "Activo", count: getProjectByStatus("activo") },
        { value: "inactivo", label: "Inactivo", count: getProjectByStatus("inactivo") },
        { value: "pendiente", label: "Pendiente", count: getQuotationByState("pendiente") },
        { value: "completado", label: "Completado", count: getQuotationByState("completado") },
        { value: "rechazado", label: "Rechazado", count: getQuotationByState("rechazado") },
    ];

    // Botones de acción para cada fila
    const actionButtons = [
        {
            label: "Editar",
            icon: <Pencil className="h-4 w-4" />,
            onClick: (row: ProjectSummary) =>
            {
                router.push(`/projects/${row.id}/update/`);
            },
            disabled: (row: ProjectSummary) => !row.isActive,
        },
        {
            label: "Eliminar",
            icon: <Trash2 className="h-4 w-4" />,
            onClick: (row: ProjectSummary) =>
            {
                setSelectedProject(row);
                setShowDeleteProject(true);
            },
            disabled: (row: ProjectSummary) => !row.isActive,
        },
    ];

    // Función para filtrar por estado
    const filterByStatus = (data: Array<ProjectSummary>, status: string) =>
    {
        if (status === "todos") return data;
        if (status === "activo") return data.filter((quotation) => quotation.isActive);
        if (status === "inactivo") return data.filter((quotation) => !quotation.isActive);
        return data;
    };

    // Funcion para filtrar por estado
    const filterByState = (data: Array<ProjectSummary>, state: string) =>
    {
        if (state === "pendiente") return data.filter((project) => project.status === "Pending");
        if (state === "completado") return data.filter((project) => project.status === "Completed");
        if (state === "rechazado") return data.filter((project) => project.status === "Rejected");
        return data;
    };

    // Acciones de la barra de herramientas
    const toolbarActions = (
        <Link href="/projects/create">
            <Button>
                <Plus />
                Crear Servicio
            </Button>
        </Link>
    );

    return (
        <>
            {/* Modales */}
            {selectedProject && (
                <>
                    {/* Eliminar un proyecto */}
                    <DeleteProject
                        open={showDeleteProject}
                        onOpenChange={setShowDeleteProject}
                        project={selectedProject}
                        showTrigger={false}
                    />
                </>
            )}
            <ProjectTable
                columns={columns}
                data={data}
                statusOptions={statusOptions}
                statusField="isActive"
                statusFilter={filterByStatus}
                stateFilter={filterByState}
                searchFields={["clientName", "price", "paymentMethod", "expirationDate", "status", "hasTaxes"]}
                dateRangeField={{ field: "createdAt", format: "dd/MM/yyyy" }}
                actionButtons={actionButtons}
                onRowClick={(row) =>
                {
                    router.push(`/projects/${row.id}`);
                }}
                toolbarActions={toolbarActions}
                emptyMessage="No hay cotizaciones registrados"
            />

        </>
    );
}

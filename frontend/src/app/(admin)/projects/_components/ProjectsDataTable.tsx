"use client";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { components } from "@/types/api";
import { ProjectTable } from "@/components/data-table/ProjectDataTable";
import { DeleteProject } from "./DeleteProject";
import { CheckCheck, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ReactivateProject } from "./ReactivateProject";

export type ProjectSummary = components["schemas"]["ProjectSummary"]

interface DataTableProps {
    columns: Array<ColumnDef<ProjectSummary, unknown>>;
    data: Array<ProjectSummary>;
}

export function ProjectsDataTable({ columns, data }: DataTableProps)
{
    const [showDeleteProject, setShowDeleteProject] = useState(false);
    const [showReactivateProject, setShowReactivateProject] = useState(false);
    const [selectedProject, setSelectedProject] = useState<ProjectSummary | null>(null);

    const router = useRouter();

    // Contar proyecto por estado
    const getProjectByStatus = (status: string) =>
    {
        if (status === "activo") return data.filter((project) => project.isActive).length;
        if (status === "inactivo") return data.filter((project) => !project.isActive).length;
        return 0;
    };

    // contar proyectos por estado
    const getQuotationByState = (state: string) =>
    {
        if (state === "pendiente") return data.filter((project) => project.status === "Pending" && project.isActive).length;
        if (state === "completado") return data.filter((project) => project.status === "Completed" && project.isActive).length;
        if (state === "rechazado") return data.filter((project) => project.status === "Rejected" && project.isActive).length;
        return 0;
    };

    // Opciones de estado para las pestañas
    const statusOptions = [
        { value: "activo", label: "Activos", count: getProjectByStatus("activo") },
        { value: "inactivo", label: "Eliminados", count: getProjectByStatus("inactivo") },
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
        {
            label: "Reactivar",
            icon: <CheckCheck className="h-4 w-4" />,
            onClick: (row: ProjectSummary) =>
            {
                setSelectedProject(row);
                setShowReactivateProject(true);
            },
            disabled: (row: ProjectSummary) => !row.isActive,
        },
    ];

    // Función para filtrar por estado
    const filterByStatus = (data: Array<ProjectSummary>, status: string) =>
    {
        if (status === "activo") return data.filter((quotation) => quotation.isActive);
        if (status === "inactivo") return data.filter((quotation) => !quotation.isActive);
        return data;
    };

    // Funcion para filtrar por estado
    const filterByState = (data: Array<ProjectSummary>, state: string) =>
    {
        if (state === "pendiente") return data.filter((project) => project.status === "Pending" && project.isActive);
        if (state === "completado") return data.filter((project) => project.status === "Completed" && project.isActive);
        if (state === "rechazado") return data.filter((project) => project.status === "Rejected" && project.isActive);
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
                    <ReactivateProject
                        open={showReactivateProject}
                        onOpenChange={setShowReactivateProject}
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
                emptyMessage="No hay cotizaciones registradas"
            />

        </>
    );
}

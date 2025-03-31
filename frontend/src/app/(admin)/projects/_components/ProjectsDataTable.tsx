"use client";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { ProjectsTableToolbarActions } from "./ProjectsTableToolbarActions";
import { Project } from "../types";
import { DataTable } from "@/components/data-table/DataTable";
import { useRouter } from "next/navigation";
import { components } from "@/types/api";

interface DataTableProps {
    columns: Array<ColumnDef<Project>>;
    data: Array<components["schemas"]["Project"]>;
}

export function ProjectsDataTable({ columns, data }: DataTableProps)
{
    const [globalFilter, setGlobalFilter] = useState("");
    const router = useRouter();

    // Función para manejar el clic en una fila
    const handleRowClick = (project: Project) =>
    {
        if (project.isActive)
        {
            router.push(`/projects/${project.id}/details`);
        }
    };

    return (
        <DataTable
            columns={columns}
            data={data}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            toolbarActions={<ProjectsTableToolbarActions />}
            onRowClick={handleRowClick}
        />
    );
}

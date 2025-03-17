"use client";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { ProjectsTableToolbarActions } from "./ProjectsTableToolbarActions";
import { DataTableExpanded } from "./DataTableExpanded";
import { Project } from "../types";

interface DataTableProps {
    columns: Array<ColumnDef<Project>>;
    data: Array<Project>;
}

export function ProjectsDataTable({ columns, data }: DataTableProps)
{
    const [globalFilter, setGlobalFilter] = useState("");

    return (
        <DataTableExpanded
            columns={columns}
            data={data}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            toolbarActions={<ProjectsTableToolbarActions />}
        />
    );
}

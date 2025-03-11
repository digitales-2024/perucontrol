"use client";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { ProjectsTableToolbarActions } from "./ProjectsTableToolbarActions";
import { DataTableExpanded } from "./DataTableExpanded";
import { components } from "@/types/api";

interface Project {
  id: string;
  area: number;
  spacesCount: number;
  orderNumber?: number;
  status?: string;
  address?: string;
  client?: components["schemas"]["Client"];
  services?: Array<components["schemas"]["Service"]>;
  quotation?: components["schemas"]["Quotation"];
  supplies?: Array<{ id: string; name: string; quantity: number; unit: string }>;
}

interface DataTableProps {
    // columns: Array<ColumnDef<TData, TValue>>;
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

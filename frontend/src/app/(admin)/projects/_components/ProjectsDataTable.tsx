"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table/DataTable";
import { type ColumnDef } from "@tanstack/react-table";
import { ProjectsTableToolbarActions } from "./ProjectsTableToolbarActions";

interface DataTableProps<TData, TValue> {
    columns: Array<ColumnDef<TData, TValue>>;
    data: Array<TData>;
}

export function ProjectsDataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>)
{
    const [globalFilter, setGlobalFilter] = useState("");

    return (
        <DataTable
            columns={columns}
            data={data}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            toolbarActions={<ProjectsTableToolbarActions />}
        />
    );
}

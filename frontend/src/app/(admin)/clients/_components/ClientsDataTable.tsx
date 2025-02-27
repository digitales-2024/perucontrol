"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table/DataTable";
import { type ColumnDef } from "@tanstack/react-table";
import { ClientTableToolbarActions } from "./ClientsTableToolbarActions";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

export function ClientsDataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>)
{
    const [globalFilter, setGlobalFilter] = useState("");

    return (
        <DataTable
            columns={columns}
            data={data}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            toolbarActions={<ClientTableToolbarActions />}
        />
    );
}

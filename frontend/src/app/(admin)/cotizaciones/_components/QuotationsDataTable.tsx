"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table/DataTable";
import { type ColumnDef } from "@tanstack/react-table";
import { QuotationTableToolbarActions } from "./QuotationTableToolbarActions";

interface DataTableProps<TData, TValue> {
    columns: Array<ColumnDef<TData, TValue>>;
    data: Array<TData>;
}

export function QuotationDataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>)
{
    const [globalFilter, setGlobalFilter] = useState("");

    return (
        <DataTable
            columns={columns}
            data={data}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            toolbarActions={<QuotationTableToolbarActions />}
        />
    );
}

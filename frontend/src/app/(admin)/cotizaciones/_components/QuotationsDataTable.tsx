"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table/DataTable";
import { type ColumnDef } from "@tanstack/react-table";
import { QuotationTableToolbarActions } from "./QuotationTableToolbarActions";
import { components } from "@/types/api";

interface DataTableProps<TData, TValue> {
    columns: Array<ColumnDef<TData, TValue>>;
    data: Array<TData>;
    terms: Array<components["schemas"]["TermsAndConditions"]>;
    clients: Array<components["schemas"]["ClientGetDTO"]>;
    services: Array<components["schemas"]["ServiceGetDTO"]>;
}

export function QuotationDataTable<TData, TValue>({ columns, data, terms, clients, services }: DataTableProps<TData, TValue>)
{
    const [globalFilter, setGlobalFilter] = useState("");

    return (
        <DataTable
            columns={columns}
            data={data}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            toolbarActions={<QuotationTableToolbarActions terms={terms} clients={clients} services={services} />}
        />
    );
}

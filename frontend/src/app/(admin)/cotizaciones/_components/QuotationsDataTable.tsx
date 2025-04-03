"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table/DataTable";
import { type ColumnDef } from "@tanstack/react-table";
import { QuotationTableToolbarActions } from "./QuotationTableToolbarActions";
import { useRouter } from "next/navigation";
import { components } from "@/types/api";

type Quotation = components["schemas"]["Quotation3"]

interface DataTableProps {
    columns: Array<ColumnDef<Quotation>>;
    data: Array<Quotation>;
}

export function QuotationDataTable({ columns, data }: DataTableProps)
{
    const [globalFilter, setGlobalFilter] = useState("");
    const router = useRouter();

    // Función para manejar el clic en una fila
    const handleRowClick = (quotation: components["schemas"]["Quotation3"]) =>
    {
        if (quotation.isActive)
        {
            router.push(`/cotizaciones/${quotation.id}`);
        }
    };

    return (
        <DataTable
            columns={columns}
            data={data}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            toolbarActions={<QuotationTableToolbarActions />}
            onRowClick={handleRowClick}
        />
    );
}

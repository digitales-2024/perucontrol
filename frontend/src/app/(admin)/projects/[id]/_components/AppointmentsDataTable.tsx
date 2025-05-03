"use client";

import { AppointmentTable } from "@/components/data-table/AppointmentDataTable";
import { useRouter } from "next/navigation";
import type { AppointmentForTable } from "./ProjectDetails";
import { ColumnDef } from "@tanstack/react-table";

interface DataTableProps<TData, TValue> {
    columns: Array<ColumnDef<TData, TValue>>
    data: Array<TData>
    projectId: string
}

export function AppointmentsDataTable<TData extends AppointmentForTable>({ columns, data, projectId }: DataTableProps<TData, unknown> & { projectId: string })
{
    const router = useRouter();

    return (
        <AppointmentTable
            columns={columns}
            data={data}
            onRowClick={(row) =>
            {
                router.push(`/projects/${projectId}/${row.id}`);
            }}
            emptyMessage="No hay fechas programadas"
        />
    );
}

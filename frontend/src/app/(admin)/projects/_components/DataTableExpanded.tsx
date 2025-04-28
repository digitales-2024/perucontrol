"use client";

import React, { useState } from "react";
import {
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ExpandedState,
} from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FileUp } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Project } from "../types";

interface DataTableProps {
    columns: Array<ColumnDef<Project>>
    data: Array<Project>
    globalFilter: string
    setGlobalFilter: (value: string) => void
    toolbarActions?: React.ReactNode
}

export function DataTableExpanded({
    columns,
    data,
    globalFilter,
    setGlobalFilter,
    toolbarActions,
}: DataTableProps)
{
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState({});
    const [expanded, setExpanded] = useState<ExpandedState>({});

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        onExpandedChange: setExpanded,
        getRowCanExpand: () => true,
        state: {
            sorting,
            columnFilters,
            rowSelection,
            globalFilter,
            expanded,
        },
    });

    return (
        <div className="overflow-x-scroll">
            <div className="flex items-center justify-between py-4">
                <Input
                    placeholder="Buscar..."
                    value={globalFilter}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="max-w-sm"
                />
                {toolbarActions &&
                    <div>
                        {toolbarActions}
                    </div>}
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="whitespace-nowrap">
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row, index) => (
                                <React.Fragment key={row.id}>
                                    <TableRow
                                        data-state={row.getIsSelected() && "selected"}
                                        className={index % 2 === 0 ? "bg-muted/50" : ""}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                    {row.getIsExpanded() && (
                                        <TableRow>
                                            <TableCell colSpan={columns.length} className="p-0">
                                                <div className="grid grid-cols-2">
                                                    <div className="p-4 bg-muted/30 grid grid-cols-2 border-t border-b">
                                                        <div className="grid grid-cols-1 gap-4 px-7">
                                                            <div className="flex justify-between">
                                                                <h3 className="text-xs font-semibold mb-2">
                                                                    Área
                                                                </h3>
                                                                <p className="text-xs ">
                                                                    {row.original.area}
                                                                    {" "}
                                                                    m2
                                                                </p>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <h3 className="text-xs font-semibold mb-2">
                                                                    Nro. de ambientes
                                                                </h3>
                                                                <p className="text-xs ">
                                                                    {row.original.spacesCount}
                                                                </p>
                                                            </div>
                                                            <div className="flex flex-col justify-between">
                                                                <h3 className="text-xs font-semibold mb-2">
                                                                    Servicios
                                                                </h3>
                                                                <div className="space-y-1">
                                                                    {row.original.services?.map((service) => (
                                                                        <p className="text-xs " key={service.id}>
                                                                            {service.name}
                                                                        </p>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <h3 className="text-xs font-semibold mb-2">
                                                                -
                                                            </h3>
                                                            <div className="grid grid-cols-3 gap-4">
                                                                {row.original.supplies?.map((supply) => (
                                                                    <div key={supply.id} className="flex justify-between">
                                                                        <span className="text-xs ">
                                                                            {supply.name}
                                                                        </span>
                                                                        <span className="text-xs ">
                                                                            {supply.quantity}
                                                                            {" "}
                                                                            {supply.unit}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4">
                                                        <div className="flex justify-around">
                                                            <div className="flex flex-col items-center gap-2">
                                                                <Label className="text-xs font-semibold">
                                                                    Generar Documentos
                                                                </Label>
                                                                <Select>
                                                                    <SelectTrigger className="text-xs w-[200px]">
                                                                        <SelectValue placeholder="Seleccione documento..." />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem className="text-xs" value="certificado">
                                                                            Certificado
                                                                        </SelectItem>
                                                                        <SelectItem className="text-xs" value="informe">
                                                                            Informe
                                                                        </SelectItem>
                                                                        <SelectItem className="text-xs" value="constancia">
                                                                            Constancia
                                                                        </SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <Button variant="outline" className="text-xs flex gap-2">
                                                                <FileUp className="h-4 w-4" />
                                                                Subir Mapa Murino
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No hay resultados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">
                            Filas por página
                        </p>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) =>
                            {
                                table.setPageSize(Number(value));
                            }}
                        >
                            <SelectTrigger className="h-8 w-[90px]">
                                <SelectValue placeholder={table.getState().pagination.pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 30, 40, 50].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">
                            Página
                            {" "}
                            {table.getState().pagination.pageIndex + 1}
                            {" "}
                            de
                            {" "}
                            {table.getPageCount()}
                        </p>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <span className="sr-only">
                                    Ir a la primera página
                                </span>
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <span className="sr-only">
                                    Ir a la página anterior
                                </span>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                <span className="sr-only">
                                    Ir a la página siguiente
                                </span>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                disabled={!table.getCanNextPage()}
                            >
                                <span className="sr-only">
                                    Ir a la última página
                                </span>
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

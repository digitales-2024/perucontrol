"use client";

import { useState } from "react";
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
} from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: Array<ColumnDef<TData, TValue>>
  data: Array<TData>
  globalFilter: string
  setGlobalFilter: (value: string) => void
  toolbarActions?: React.ReactNode
  isLoading?: boolean
  emptyMessage?: string
  onRowClick?: (data: TData) => void
}

export function DataTable<TData, TValue>({
    columns,
    data,
    globalFilter,
    setGlobalFilter,
    toolbarActions,
    isLoading = false,
    emptyMessage = "No hay resultados.",
    onRowClick,
}: DataTableProps<TData, TValue>)
{
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState({});

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
        state: {
            sorting,
            columnFilters,
            rowSelection,
            globalFilter,
        },
    });

    return (
        <div className="overflow-x-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar..."
                        value={globalFilter}
                        onChange={(event) => setGlobalFilter(event.target.value)}
                        className="pl-8 w-full"
                    />
                </div>
                {toolbarActions && (
                    <div className="flex justify-end">
                        {toolbarActions}
                    </div>
                )}
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
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    <div className="flex justify-center items-center">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                                        <span className="ml-2">
                                            Cargando...
                                        </span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row, index) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className={`${index % 2 === 0 ? "bg-muted/50" : ""} ${onRowClick ? "cursor-pointer hover:bg-muted" : ""}`}
                                    onClick={() => onRowClick && onRowClick(row.original)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 py-4">
                <div className="text-sm text-muted-foreground">
                    {table.getFilteredRowModel().rows.length}
                    {" "}
                    resultado(s) encontrado(s)
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center space-x-2">
                        <p className="text-xs md:text-sm font-medium">
                            Filas por página
                        </p>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) =>
                            {
                                table.setPageSize(Number(value));
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
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
                        <p className="text-xs md:text-sm font-medium">
                            Página
                            {" "}
                            {table.getState().pagination.pageIndex + 1}
                            {" "}
                            de
                            {" "}
                            {table.getPageCount() || 1}
                        </p>
                        <div className="flex items-center space-x-1">
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 sm:flex"
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage() || isLoading}
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
                                disabled={!table.getCanPreviousPage() || isLoading}
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
                                disabled={!table.getCanNextPage() || isLoading}
                            >
                                <span className="sr-only">
                                    Ir a la página siguiente
                                </span>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 sm:flex"
                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                disabled={!table.getCanNextPage() || isLoading}
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


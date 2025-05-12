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
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface DataTableProps<TData> {
    columns: Array<ColumnDef<TData>>
    data: Array<TData>
    globalFilter: string
    setGlobalFilter: (value: string) => void
    toolbarActions?: React.ReactNode
    renderExpandedContent?: (row: TData) => React.ReactNode
}

export function DataTableExpanded<TData>({
    columns,
    data,
    globalFilter,
    setGlobalFilter,
    toolbarActions,
    renderExpandedContent,
}: DataTableProps<TData>)
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
                                    {row.getIsExpanded() && renderExpandedContent && (
                                        <TableRow>
                                            <TableCell colSpan={columns.length} className="p-0">
                                                {renderExpandedContent(row.original)}
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

// "use client";

// import React, { useState } from "react";
// import {
//     type ColumnDef,
//     type ColumnFiltersState,
//     type SortingState,
//     flexRender,
//     getCoreRowModel,
//     getFilteredRowModel,
//     getPaginationRowModel,
//     getSortedRowModel,
//     useReactTable,
//     type ExpandedState,
// } from "@tanstack/react-table";

// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from "lucide-react";

// interface DataTableProps<TData> {
//   columns: Array<ColumnDef<TData>>
//   data: Array<TData>
//   globalFilter: string
//   setGlobalFilter: (value: string) => void
//   toolbarActions?: React.ReactNode
//   renderExpandedContent?: (row: TData) => React.ReactNode
// }

// export function DataTableExpanded<TData>({
//     columns,
//     data,
//     globalFilter,
//     setGlobalFilter,
//     toolbarActions,
//     renderExpandedContent,
// }: DataTableProps<TData>)
// {
//     const [sorting, setSorting] = useState<SortingState>([]);
//     const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
//     const [rowSelection, setRowSelection] = useState({});
//     const [expanded, setExpanded] = useState<ExpandedState>({});

//     const table = useReactTable({
//         data,
//         columns,
//         getCoreRowModel: getCoreRowModel(),
//         getPaginationRowModel: getPaginationRowModel(),
//         onSortingChange: setSorting,
//         getSortedRowModel: getSortedRowModel(),
//         onColumnFiltersChange: setColumnFilters,
//         getFilteredRowModel: getFilteredRowModel(),
//         onRowSelectionChange: setRowSelection,
//         onExpandedChange: setExpanded,
//         getRowCanExpand: () => true,
//         state: {
//             sorting,
//             columnFilters,
//             rowSelection,
//             globalFilter,
//             expanded,
//         },
//     });

//     return (
//         <div className="w-full space-y-4">
//             <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
//                 <div className="relative w-full max-w-sm">
//                     <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
//                     <Input
//                         placeholder="Buscar..."
//                         value={globalFilter}
//                         onChange={(event) => setGlobalFilter(event.target.value)}
//                         className="pl-9 border-slate-200 focus-visible:ring-slate-400 w-full"
//                     />
//                 </div>
//                 {toolbarActions && <div className="flex gap-2">
//                     {toolbarActions}
//                 </div>}
//             </div>

//             <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
//                 <div className="overflow-x-auto">
//                     <Table>
//                         <TableHeader className="bg-slate-50">
//                             {table.getHeaderGroups().map((headerGroup) => (
//                                 <TableRow key={headerGroup.id} className="border-slate-200 hover:bg-slate-50/80">
//                                     {headerGroup.headers.map((header) => (
//                                         <TableHead key={header.id} className="whitespace-nowrap py-3 text-slate-700 font-medium">
//                                             {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
//                                         </TableHead>
//                                     ))}
//                                 </TableRow>
//                             ))}
//                         </TableHeader>
//                         <TableBody>
//                             {table.getRowModel().rows?.length ? (
//                                 table.getRowModel().rows.map((row, index) => (
//                                     <React.Fragment key={row.id}>
//                                         <TableRow
//                                             data-state={row.getIsSelected() && "selected"}
//                                             className={`
//                         border-slate-200 transition-colors
//                         ${index % 2 === 0 ? "bg-white" : "bg-slate-50/50"}
//                         ${row.getIsSelected() ? "bg-slate-100" : ""}
//                         ${row.getIsExpanded() ? "border-b-0" : ""}
//                         hover:bg-slate-100
//                       `}
//                                         >
//                                             {row.getVisibleCells().map((cell) => (
//                                                 <TableCell key={cell.id} className="py-3">
//                                                     {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                                                 </TableCell>
//                                             ))}
//                                         </TableRow>
//                                         {row.getIsExpanded() && renderExpandedContent && (
//                                             <TableRow className="border-slate-200 bg-slate-50/80">
//                                                 <TableCell colSpan={columns.length} className="p-4 border-t border-slate-100">
//                                                     <div className="rounded-md bg-white p-4 border border-slate-200 shadow-sm">
//                                                         {renderExpandedContent(row.original)}
//                                                     </div>
//                                                 </TableCell>
//                                             </TableRow>
//                                         )}
//                                     </React.Fragment>
//                                 ))
//                             ) : (
//                                 <TableRow className="hover:bg-transparent">
//                                     <TableCell colSpan={columns.length} className="h-32 text-center text-slate-500">
//                                         No hay resultados.
//                                     </TableCell>
//                                 </TableRow>
//                             )}
//                         </TableBody>
//                     </Table>
//                 </div>
//             </div>

//             <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
//                 <div className="flex items-center gap-2 text-sm text-slate-600">
//                     <span>
//                         Mostrando
//                     </span>
//                     <strong className="font-medium">
//                         {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
//                         -
//                         {Math.min(
//                             (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
//                             table.getFilteredRowModel().rows.length,
//                         )}
//                     </strong>
//                     <span>
//                         de
//                     </span>
//                     <strong className="font-medium">
//                         {table.getFilteredRowModel().rows.length}
//                     </strong>
//                     <span>
//                         registros
//                     </span>
//                 </div>

//                 <div className="flex items-center justify-end gap-6">
//                     <div className="flex items-center gap-2">
//                         <p className="text-sm font-medium text-slate-600">
//                             Filas por página
//                         </p>
//                         <Select
//                             value={`${table.getState().pagination.pageSize}`}
//                             onValueChange={(value) =>
//                             {
//                                 table.setPageSize(Number(value));
//                             }}
//                         >
//                             <SelectTrigger className="h-8 w-[70px] border-slate-200 focus:ring-slate-400">
//                                 <SelectValue placeholder={table.getState().pagination.pageSize} />
//                             </SelectTrigger>
//                             <SelectContent side="top" className="min-w-[70px]">
//                                 {[10, 20, 30, 40, 50].map((pageSize) => (
//                                     <SelectItem key={pageSize} value={`${pageSize}`}>
//                                         {pageSize}
//                                     </SelectItem>
//                                 ))}
//                             </SelectContent>
//                         </Select>
//                     </div>

//                     <div className="flex items-center gap-1">
//                         <Button
//                             variant="outline"
//                             size="icon"
//                             className="h-8 w-8 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-700"
//                             onClick={() => table.setPageIndex(0)}
//                             disabled={!table.getCanPreviousPage()}
//                         >
//                             <span className="sr-only">
//                                 Ir a la primera página
//                             </span>
//                             <ChevronsLeft className="h-4 w-4" />
//                         </Button>
//                         <Button
//                             variant="outline"
//                             size="icon"
//                             className="h-8 w-8 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-700"
//                             onClick={() => table.previousPage()}
//                             disabled={!table.getCanPreviousPage()}
//                         >
//                             <span className="sr-only">
//                                 Ir a la página anterior
//                             </span>
//                             <ChevronLeft className="h-4 w-4" />
//                         </Button>

//                         <span className="flex items-center gap-1 text-sm">
//                             <span className="text-slate-600">
//                                 Página
//                             </span>
//                             <strong className="font-medium text-slate-700">
//                                 {table.getState().pagination.pageIndex + 1}
//                             </strong>
//                             <span className="text-slate-600">
//                                 de
//                             </span>
//                             <strong className="font-medium text-slate-700">
//                                 {table.getPageCount() || 1}
//                             </strong>
//                         </span>

//                         <Button
//                             variant="outline"
//                             size="icon"
//                             className="h-8 w-8 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-700"
//                             onClick={() => table.nextPage()}
//                             disabled={!table.getCanNextPage()}
//                         >
//                             <span className="sr-only">
//                                 Ir a la página siguiente
//                             </span>
//                             <ChevronRight className="h-4 w-4" />
//                         </Button>
//                         <Button
//                             variant="outline"
//                             size="icon"
//                             className="h-8 w-8 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-700"
//                             onClick={() => table.setPageIndex(table.getPageCount() - 1)}
//                             disabled={!table.getCanNextPage()}
//                         >
//                             <span className="sr-only">
//                                 Ir a la última página
//                             </span>
//                             <ChevronsRight className="h-4 w-4" />
//                         </Button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

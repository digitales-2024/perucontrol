"use client";

import { useState, useEffect } from "react";
import { Search, X, Calendar, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    type ColumnDef,
    type SortingState,
    type ColumnFiltersState,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "../ui/badge";

export type StatusOption = {
  value: string
  label: string
  count: number
}

type ActionButton<T> = {
  label: string
  icon?: React.ReactNode
  onClick: (row: T) => void
  disabled?: (row: T) => boolean
  className?: string
}

type DropdownAction<T> = {
  label: string
  icon?: React.ReactNode
  onClick: (row: T) => void
  disabled?: (row: T) => boolean
  className?: string
}

type DateRangeField = {
  field: string
  format: string
}

interface OperationSheetTableProps<T> {
  columns: Array<ColumnDef<T>>
  data: Array<T>
  statusOptions?: Array<StatusOption>
  statusField?: keyof T | string
  statusFilter?: (data: Array<T>, status: string) => Array<T>
  igvFilter?: (data: Array<T>, igv: string) => Array<T>,
  stateFilter?: (data: Array<T>, state: string) => Array<T>,
  searchFields?: Array<keyof T | string>
  dateRangeField?: DateRangeField | null
  actionButtons?: Array<ActionButton<T>>
  dropdownActions?: Array<DropdownAction<T>>
  onRowClick?: (row: T) => void
  toolbarActions?: React.ReactNode
  emptyMessage?: string
  className?: string
}

export function OperationSheetTable<T extends object>({
    columns,
    data,
    statusOptions,
    statusField,
    statusFilter,
    igvFilter,
    stateFilter,
    searchFields,
    dateRangeField,
    actionButtons,
    dropdownActions,
    onRowClick,
    toolbarActions,
    emptyMessage = "No se encontraron resultados",
    className,
}: OperationSheetTableProps<T>)
{
    const [activeTab, setActiveTab] = useState("todos");
    const [searchTerm, setSearchTerm] = useState("");
    const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
        from: undefined,
        to: undefined,
    });
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [filteredData, setFilteredData] = useState<Array<T>>(data);

    // Filtrar datos cuando cambian los filtros
    useEffect(() =>
    {
        let result = [...data];

        // Filtrar por estado
        if (statusFilter && activeTab !== "todos")
        {
            result = statusFilter(result, activeTab);
        }
        else if (statusField && activeTab !== "todos")
        {
            // Filtrado básico por campo de estado si no se proporciona una función personalizada
            result = result.filter((item) =>
            {
                const fieldValue = statusField in item ? item[statusField as keyof T] : undefined;
                if (activeTab === "activo") return Boolean(fieldValue);
                if (activeTab === "inactivo") return !Boolean(fieldValue);
                return true;
            });
        }

        // Filtar por IGV
        if (igvFilter && activeTab !== "todos")
        {
            result = igvFilter(result, activeTab);
        }
        else if (statusField && activeTab !== "todos")
        {
            // Filtrado básico por campo de tipo de documento si no se proporciona una función personalizada
            result = result.filter((item) =>
            {
                const fieldValue = statusField in item ? item[statusField as keyof T] : undefined;
                if (activeTab === "con") return fieldValue === "con";
                if (activeTab === "sin") return fieldValue === "sin";
                return true;
            });
        }

        // Filtrar por estado
        if (stateFilter && activeTab !== "todos")
        {
            result = stateFilter(result, activeTab);
        }
        else if (statusField && activeTab !== "todos")
        {
            // Filtrado básico por campo de estado si no se proporciona una función personalizada
            result = result.filter((item) =>
            {
                const fieldValue = statusField in item ? item[statusField as keyof T] : undefined;
                if (activeTab === "pendiente") return fieldValue === "Pendiente";
                if (activeTab === "aprovado") return fieldValue === "Aprobado";
                if (activeTab === "rechazado") return fieldValue === "Rechazado";
                return true;
            });
        }

        // Filtrar por término de búsqueda
        if (searchTerm && searchFields && searchFields.length > 0)
        {
            result = result.filter((item) => searchFields.some((field) =>
            {
                const fieldValue = field in item ? String(item[field as keyof T]) : "";
                return fieldValue.toLowerCase().includes(searchTerm.toLowerCase());
            }));
        }

        // Filtrar por rango de fechas
        if (dateRangeField && dateRange.from && dateRange.to)
        {
            result = result.filter((item) =>
            {
                const fieldValue = dateRangeField.field in item ? item[dateRangeField.field as keyof T] : null;
                if (!fieldValue) return false;

                const itemDate = new Date(fieldValue as string);
                if (isNaN(itemDate.getTime())) return false;

                // Set time to midnight for accurate date comparison
                const from = new Date(dateRange.from!);
                const to = new Date(dateRange.to!);
                from.setHours(0, 0, 0, 0);
                to.setHours(23, 59, 59, 999);
                itemDate.setHours(0, 0, 0, 0);

                return itemDate >= from && itemDate <= to;
            });
        }

        setFilteredData(result);
    }, [data, activeTab, searchTerm, dateRange, statusField, statusFilter, stateFilter, igvFilter, searchFields, dateRangeField]);

    // Configurar la tabla
    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        state: {
            sorting,
            columnFilters,
        },
    });

    // Formatear rango de fechas para mostrar
    const formattedDateRange = () =>
    {
        if (dateRange.from && dateRange.to)
        {
            return `${format(dateRange.from, "dd/MM/yyyy")} - ${format(dateRange.to, "dd/MM/yyyy")}`;
        }
        return "";
    };

    // Limpiar filtro de fechas
    const clearDateRange = () =>
    {
        setDateRange({ from: undefined, to: undefined });
    };

    return (
        <div className={cn("w-full rounded-md shadow-sm border border-gray-200 mt-4 bg-transparent", className)}>
            {/* Tabs de estado */}
            {statusOptions && statusOptions.length > 0 && (
                <div className="flex overflow-x-auto border-b border-gray-200">
                    {statusOptions.map((option) => (
                        <button
                            key={option.value}
                            className={cn(
                                "px-4 py-2 text-sm font-medium whitespace-nowrap flex items-center",
                                activeTab === option.value
                                    ? "border-b-2 border-blue-500 text-blue-600"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                            )}
                            onClick={() => setActiveTab(option.value)}
                        >
                            {option.label}
                            <Badge
                                className={cn(
                                    "ml-2 px-1.5 py-0.5 rounded-full text-xs",
                                    activeTab === option.value ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800",
                                )}
                            >
                                {option.count}
                            </Badge>
                        </button>
                    ))}
                </div>
            )}

            {/* Barra de búsqueda y filtros */}
            <div className="flex flex-col sm:flex-row justify-between p-4 gap-4">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Buscar"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-md"
                    />
                </div>

                <div className="flex items-center gap-2">
                    {dateRangeField && (
                        <>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "justify-start text-left font-normal border border-gray-300",
                                            !dateRange.from && "text-muted-foreground",
                                        )}
                                    >
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {dateRange.from ? formattedDateRange() : (
                                            <span>
                                                Seleccionar fechas
                                            </span>)
                                        }
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                    <CalendarComponent
                                        initialFocus
                                        mode="range"
                                        defaultMonth={dateRange.from}
                                        selected={{
                                            from: dateRange.from,
                                            to: dateRange.to,
                                        }}
                                        onSelect={(range) =>
                                        {
                                            setDateRange({
                                                from: range?.from,
                                                to: range?.to,
                                            });
                                        }}
                                        numberOfMonths={2}
                                        locale={es}
                                    />
                                </PopoverContent>
                            </Popover>

                            {dateRange.from && dateRange.to && (
                                <Button variant="ghost" size="icon" onClick={clearDateRange} className="h-8 w-8">
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </>
                    )}

                    {toolbarActions && (
                        <div className="flex items-center gap-2 ml-auto">
                            {toolbarActions}
                        </div>)}
                </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-gray-50 text-xs uppercase text-gray-500 border-y border-gray-200">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="px-4 py-3 text-left font-semibold">
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                                {((actionButtons?.length ?? 0) > 0 || (dropdownActions?.length ?? 0) > 0) && (
                                    <TableHead className="px-4 py-3 text-black text-center hover:bg-transparent font-bold text-sm md:text-base">
                                        Acciones
                                    </TableHead>
                                )}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className="border-b border-gray-200 hover:bg-gray-50"
                                    onClick={() => onRowClick && onRowClick(row.original)}
                                    style={{ cursor: onRowClick ? "pointer" : "default" }}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="px-4 py-3 text-sm">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                    {((actionButtons?.length ?? 0) > 0 || (dropdownActions?.length ?? 0) > 0) && (
                                        <TableCell className="px-4 py-3">
                                            <div className="flex items-center justify-end space-x-1" onClick={(e) => e.stopPropagation()}>
                                                {actionButtons?.map((action, index) =>
                                                {
                                                    const isDisabled = action.disabled ? action.disabled(row.original) : false;
                                                    return (
                                                        <TooltipProvider key={index}>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className={cn("h-8 w-8 p-0 ml-2", action.className)}
                                                                        onClick={() => !isDisabled && action.onClick(row.original)}
                                                                        disabled={isDisabled}
                                                                    >
                                                                        <span className="sr-only">
                                                                            {action.label}
                                                                        </span>
                                                                        {action.icon}
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>
                                                                        {action.label}
                                                                    </p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    );
                                                })}

                                                {dropdownActions && dropdownActions.length > 0 && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                <span className="sr-only">
                                                                    Abrir menú
                                                                </span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            {dropdownActions.map((action, index) =>
                                                            {
                                                                const isDisabled = action.disabled ? action.disabled(row.original) : false;
                                                                return (
                                                                    <DropdownMenuItem
                                                                        key={index}
                                                                        onClick={() => !isDisabled && action.onClick(row.original)}
                                                                        disabled={isDisabled}
                                                                        className={cn("cursor-pointer", action.className)}
                                                                    >
                                                                        {action.icon && (
                                                                            <span className="mr-2">
                                                                                {action.icon}
                                                                            </span>)}
                                                                        <span>
                                                                            {action.label}
                                                                        </span>
                                                                    </DropdownMenuItem>
                                                                );
                                                            })}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length + (actionButtons?.length || dropdownActions?.length ? 1 : 0)}
                                    className="px-4 py-6 text-center text-gray-500"
                                >
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Paginación */}
            <div className="flex items-center justify-end px-4 py-3 border-t border-gray-200">
                <div className="flex items-center space-x-1">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">
                            Primera página
                        </span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M11 17L6 12L11 7"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M18 17L13 12L18 7"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">
                            Página anterior
                        </span>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center border rounded-xl text-white bg-blue-600 justify-center h-8 w-8 text-sm font-medium">
                        {table.getState().pagination.pageIndex + 1}
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">
                            Página siguiente
                        </span>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">
                            Última página
                        </span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M13 7L18 12L13 17"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M6 7L11 12L6 17"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </Button>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface SupplierTableProps<T> {
    columns: Array<ColumnDef<T>>
    data: Array<T>
    statusOptions?: Array<StatusOption>
    statusField?: keyof T | string
    statusFilter?: (data: Array<T>, status: string) => Array<T>
    typeDocumentFilter?: (data: Array<T>, typeDocument: string) => Array<T>,
    searchFields?: Array<keyof T | string>
    actionButtons?: Array<ActionButton<T>>
    dropdownActions?: Array<DropdownAction<T>>
    onRowClick?: (row: T) => void
    toolbarActions?: React.ReactNode
    emptyMessage?: string
    className?: string
}

export function SupplierTable<T extends object>({
    columns,
    data,
    statusOptions,
    statusField,
    statusFilter,
    typeDocumentFilter,
    searchFields,
    actionButtons,
    dropdownActions,
    onRowClick,
    toolbarActions,
    emptyMessage = "No se encontraron resultados",
    className,
}: SupplierTableProps<T>)
{
    const [activeTab, setActiveTab] = useState("activo");
    const [searchTerm, setSearchTerm] = useState("");
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [filteredData, setFilteredData] = useState<Array<T>>(() =>
    {
        const initialData = [...data];

        // Aplicar filtro de activos por defecto
        if (statusFilter)
        {
            return statusFilter(initialData, "activo");
        }
        if (statusField)
        {
            return initialData.filter((item) =>
            {
                const fieldValue =
					statusField in item
					    ? item[statusField as keyof T]
					    : undefined;
                return Boolean(fieldValue);
            });
        }
        return initialData;
    });

    // Filtrar datos cuando cambian los filtros
    useEffect(() =>
    {
        let result = [...data];

        // 1. Primero aplicar filtro por estado (activo/inactivo)
        if (statusFilter)
        {
            result = statusFilter(
                result,
                activeTab === "dni" || activeTab === "ruc"
                    ? "activo"
                    : activeTab,
            );
        }
        else if (statusField)
        {
            result = result.filter((item) =>
            {
                const isActive = Boolean(statusField in item
                    ? item[statusField as keyof T]
                    : undefined);
                return activeTab === "inactivo" ? !isActive : isActive;
            });
        }

        // 2. Luego aplicar filtro por tipo de documento si corresponde
        if (
            (activeTab === "dni" || activeTab === "ruc") &&
			typeDocumentFilter
        )
        {
            result = typeDocumentFilter(result, activeTab);
        }

        // 3. Filtrar por término de búsqueda
        if (searchTerm && searchFields && searchFields.length > 0)
        {
            result = result.filter((item) => searchFields.some((field) =>
            {
                const fieldValue =
						field in item ? String(item[field as keyof T]) : "";
                return fieldValue
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());
            }));
        }

        setFilteredData(result);
    }, [
        data,
        activeTab,
        searchTerm,
        statusField,
        statusFilter,
        typeDocumentFilter,
        searchFields,
    ]);

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

    return (
        <div
            className={cn(
                "w-full rounded-md shadow-sm border border-gray-200 mt-4 bg-transparent",
                className,
            )}
        >
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
                                    activeTab === option.value
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-gray-100 text-gray-800",
                                )}
                            >
                                {option.count}
                            </Badge>
                        </button>
                    ))}
                </div>
            )}

            {/* Barra de búsqueda y filtros */}
            <div className="flex flex-wrap flex-col sm:flex-row justify-between p-4 gap-4">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Buscar"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-md"
                    />
                </div>

                <div className="flex flex-wrap sm:items-center gap-2">
                    {toolbarActions && (
                        <div className="flex items-center gap-2 ml-0 sm:ml-auto">
                            {toolbarActions}
                        </div>
                    )}
                </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-gray-50 text-xs uppercase text-gray-500 border-y border-gray-200">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="px-4 py-3 text-left font-semibold"
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef
                                                    .header,
                                                header.getContext(),
											  )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className="border-b border-gray-200 hover:bg-gray-50"
                                    onClick={() => onRowClick && onRowClick(row.original)
                                    }
                                    style={{
                                        cursor: onRowClick
                                            ? "pointer"
                                            : "default",
                                    }}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className="px-4 py-3 text-sm"
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                    {((actionButtons?.length ?? 0) > 0 ||
										(dropdownActions?.length ?? 0) > 0) && (
                                        <TableCell className="px-4 py-3">
    																				<div
                                                className="flex items-center justify-end space-x-1"
                                                onClick={(e) => e.stopPropagation()
                                                }
                                            >
                                                {actionButtons?.map((action, index) =>
                                                {
                                                    const isDisabled =
															action.disabled
															    ? action.disabled(row.original)
															    : false;

                                                    // Determinar si el botón debe ser mostrado
                                                    const showButton =
															(action.label ===
																"Eliminar" &&
																!isDisabled) ||
															(action.label ===
																"Reactivar" &&
																isDisabled) ||
															(action.label ===
																"Editar" &&
																!isDisabled);

                                                    return (
                                                        showButton && ( // Solo renderiza el botón si debe ser mostrado
                                                            <TooltipProvider
                                                                key={index}
                                                            >
                                                                <Tooltip>
                                                                    <TooltipTrigger
                                                                        asChild
                                                                    >
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className={cn(
                                                                                "h-8 w-8 p-0",
                                                                                action.className,
                                                                            )}
                                                                            onClick={() => action.onClick(row.original)
                                                                            }
                                                                            disabled={
                                                                                action.label ===
																						"Reactivar" &&
																					!isDisabled
                                                                            }
                                                                        >
                                                                            <span className="sr-only">
                                                                                {
                                                                                    action.label
                                                                                }
                                                                            </span>
                                                                            {
                                                                                action.icon
                                                                            }
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>
                                                                            {
                                                                                action.label
                                                                            }
                                                                        </p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )
                                                    );
                                                })}

                                                {dropdownActions &&
													dropdownActions.length >
														0 && (
                                                    <DropdownMenu>
    <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
        >
            <span className="sr-only">
                                                                    Abrir
                                                                    menú
                                                                </span>
            <MoreHorizontal className="h-4 w-4" />
        </Button>
                                                        </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
                                                            {dropdownActions.map((
                                                                action,
                                                                index,
                                                            ) =>
                                                            {
                                                                const isDisabled =
																			action.disabled
																			    ? action.disabled(row.original)
																			    : false;
                                                                return (
                                                                    <DropdownMenuItem
                                                                        key={
                                                                            index
                                                                        }
                                                                        onClick={() => !isDisabled &&
																					action.onClick(row.original)
                                                                        }
                                                                        disabled={
                                                                            isDisabled
                                                                        }
                                                                        className={cn(
                                                                            "cursor-pointer",
                                                                            action.className,
                                                                        )}
                                                                    >
                                                                        {action.icon && (
                                                                            <span className="mr-2">
                                                                                {
                                                                                    action.icon
                                                                                }
                                                                            </span>
                                                                        )}
                                                                        <span>
                                                                            {
                                                                                action.label
                                                                            }
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
                                    colSpan={
                                        columns.length +
										(actionButtons?.length ||
										dropdownActions?.length
										    ? 1
										    : 0)
                                    }
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
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
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
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)
                        }
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">
                            Última página
                        </span>
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
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

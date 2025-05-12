"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTableExpanded } from "@/app/(admin)/projects/_components/DataTableExpanded";
import { Button } from "@/components/ui/button";
import { Package, ChevronDown, ChevronRight, Pencil, Trash2, CheckCheck } from "lucide-react";
import { components } from "@/types/api";
import { CreateProductSheet } from "./CreateProductSheet";
import { UpdateProductSheet } from "./UpdateProductSheet";
import { DeleteProduct } from "./DeleteProduct";
import { ReactivateProduct } from "./ReactivateProduct";

type Product = components["schemas"]["ProductGetAllOutputDTO"];

export function ProductsDataTable({ data }: { data: Array<Product> })
{
    const [globalFilter, setGlobalFilter] = useState("");
    const [showCreateProduct, setShowCreateProduct] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showUpdateProduct, setShowUpdateProduct] = useState(false);
    const [showDeleteProduct, setShowDeleteProduct] = useState(false);
    const [showReactivateProduct, setShowReactivateProduct] = useState(false);

    const columns: Array<ColumnDef<Product>> = [
        {
            id: "expand",
            header: () => null,
            cell: ({ row }) => (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => row.toggleExpanded()}
                    className="h-8 w-8 p-0"
                >
                    {row.getIsExpanded() ? (
                        <ChevronDown className="h-4 w-4" />
                    ) : (
                        <ChevronRight className="h-4 w-4" />
                    )}
                </Button>
            ),
        },
        {
            accessorKey: "name",
            header: "Nombre",
        },
        {
            accessorKey: "activeIngredient",
            header: "Ingrediente Activo",
        },
        {
            accessorKey: "isActive",
            header: "Estado",
            cell: ({ row }) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.original.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {row.original.isActive ? "Activo" : "Inactivo"}
                </span>
            ),
        },
        {
            id: "actions",
            header: "Acciones",
            cell: ({ row }) =>
            {
                const product = row.original;
                return (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() =>
                            {
                                setSelectedProduct(product);
                                setShowUpdateProduct(true);
                            }}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() =>
                            {
                                setSelectedProduct(product);
                                setShowDeleteProduct(true);
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-red-50"
                            onClick={() =>
                            {
                                setSelectedProduct(product);
                                setShowReactivateProduct(true);
                            }}
                        >
                            <CheckCheck className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    // Acciones de la barra de herramientas
    const toolbarActions = (
        <Button
            variant="default"
            size="sm"
            className="ml-auto"
            onClick={() => setShowCreateProduct(true)}
        >
            <Package className="h-4 w-4 mr-2" />
            Nuevo producto
        </Button>
    );

    // Renderizar el contenido expandible con los solventes
    const renderExpandedContent = (product: Product) => (
        <div className="p-4 bg-muted/30 border-t border-b">
            <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col">
                    <h3 className="text-sm font-semibold mb-3 text-slate-700">
                        Solventes Disponibles
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {product.productAmountSolvents.map((solvent) => (
                            <div
                                key={solvent.id}
                                className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm"
                            >
                                <span className="text-sm text-slate-600">
                                    {solvent.amountAndSolvent}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <DataTableExpanded
                columns={columns}
                data={data}
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                toolbarActions={toolbarActions}
                renderExpandedContent={renderExpandedContent}
            />
            <CreateProductSheet
                open={showCreateProduct}
                onOpenChange={setShowCreateProduct}
            />
            {selectedProduct && (
                <>
                    <UpdateProductSheet
                        open={showUpdateProduct}
                        onOpenChange={setShowUpdateProduct}
                        product={selectedProduct}
                    />
                    <DeleteProduct
                        open={showDeleteProduct}
                        onOpenChange={setShowDeleteProduct}
                        product={selectedProduct}
                        showTrigger={false}
                    />
                    <ReactivateProduct
                        open={showReactivateProduct}
                        onOpenChange={setShowReactivateProduct}
                        product={selectedProduct}
                        showTrigger={false}
                    />
                </>
            )}
        </>
    );
}

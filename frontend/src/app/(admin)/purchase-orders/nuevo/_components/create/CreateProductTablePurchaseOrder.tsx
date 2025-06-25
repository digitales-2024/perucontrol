import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CreatePurchaseOrderSchema } from "../../../_schemas/createPurchaseOrdesSchema";
import { useFieldArray, UseFormReturn } from "react-hook-form";

interface CreateProductTablePurchaseOrderProps {
	form: UseFormReturn<CreatePurchaseOrderSchema>;
	watchedCurrency: "PEN" | "USD";
}

export default function CreateProductTablePurchaseOrder({
    form,
    watchedCurrency,
}: CreateProductTablePurchaseOrderProps)
{
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "products",
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center">
                <div className="w-1 h-12 bg-gradient-to-b from-primary/80 to-emerald-500 rounded-full mr-6" />
                <div>
                    <h2 className="text-gray-900">
                        PRODUCTOS
                    </h2>
                    <p className="text-gray-600">
                        Detalle de productos para la orden de compra.
                    </p>
                </div>
            </div>

            {/* Enhanced Responsive Products Table */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
                {/* Enhanced Desktop Table Header */}
                <div className="hidden lg:block bg-gradient-to-r from-slate-800 to-slate-700 text-white p-3">
                    <div className="grid grid-cols-12 gap-6 items-center font-semibold text-sm uppercase tracking-wide">
                        <div className="col-span-1 text-center">
                            #
                        </div>
                        <div className="col-span-4">
                            PRODUCTO
                        </div>
                        <div className="col-span-3">
                            DESCRIPCIÓN
                        </div>
                        <div className="col-span-1 text-center">
                            CANT.
                        </div>
                        <div className="col-span-2 text-center">
                            PRECIO UNIT.
                        </div>
                        <div className="col-span-1 text-center">
                            ACCIONES
                        </div>
                    </div>
                </div>

                {/* Enhanced Products List */}
                <div>
                    {fields.map((field, index) => (
                        <div key={field.id}>
                            {/* Enhanced Desktop Layout */}
                            <div
                                className={`hidden lg:grid grid-cols-12 gap-6 items-center p-3 ${
                                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                } ${
                                    index !== fields.length - 1
                                        ? "border-b border-gray-200"
                                        : ""
                                } hover:bg-primary/5 transition-colors duration-200`}
                            >
                                <div className="col-span-1 text-center">
                                    <div className="w-7 h-7 bg-gradient-to-br from-slate-700 to-slate-800 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-lg">
                                        {index + 1}
                                    </div>
                                </div>

                                <div className="col-span-4">
                                    <FormField
                                        control={form.control}
                                        name={`products.${index}.name`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Nombre del producto"
                                                        className="border-gray-200 rounded-xl hover:border-blue-300 transition-colors"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="col-span-3">
                                    <FormField
                                        control={form.control}
                                        name={`products.${index}.description`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Especificación técnica"
                                                        className="border-gray-200 rounded-xl hover:border-blue-300 transition-colors"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="col-span-1">
                                    <FormField
                                        control={form.control}
                                        name={`products.${index}.quantity`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        className="border-gray-200 rounded-xl text-center hover:border-blue-300 transition-colors"
                                                        {...field}
                                                        onChange={(e) => field.onChange(Number.parseInt(
                                                            e.target
                                                                .value,
                                                            10,
                                                        ) || 0)
                                                        }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="col-span-2">
                                    <FormField
                                        control={form.control}
                                        name={`products.${index}.unitPrice`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-semibold">
                                                            {watchedCurrency ===
															"PEN"
                                                                ? "S/."
                                                                : "US$"}
                                                        </span>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            className="border-gray-200 rounded-xl pl-12 hover:border-blue-300 transition-colors"
                                                            {...field}
                                                            onChange={(e) => field.onChange(Number.parseFloat(e.target
                                                                .value) || 0)
                                                            }
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="col-span-1 text-center">
                                    {fields.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => remove(index)}
                                            className="border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Enhanced Mobile Layout */}
                            <div
                                className={`lg:hidden p-6 ${
                                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                } ${
                                    index !== fields.length - 1
                                        ? "border-b border-gray-200"
                                        : ""
                                }`}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                                            {index + 1}
                                        </div>
                                        <h4 className="font-bold text-gray-900 text-lg">
                                            Producto
                                            {" "}
                                            {index + 1}
                                        </h4>
                                    </div>
                                    {fields.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => remove(index)}
                                            className="h-10 w-10 p-0 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                <div className="space-y-5">
                                    <FormField
                                        control={form.control}
                                        name={`products.${index}.name`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                                    Producto
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Nombre del producto"
                                                        className="border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-colors"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={`products.${index}.description`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                                    Descripción
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Especificación técnica"
                                                        className="border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-colors"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name={`products.${index}.quantity`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                                        Cantidad
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            className="border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-colors"
                                                            {...field}
                                                            onChange={(e) => field.onChange(Number.parseInt(
                                                                e.target
                                                                    .value,
                                                                10,
                                                            ) || 0)
                                                            }
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name={`products.${index}.unitPrice`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                                        Precio (
                                                        {watchedCurrency ===
														"PEN"
                                                            ? "S/."
                                                            : "US$"}
                                                        )
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            className="border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-colors"
                                                            {...field}
                                                            onChange={(e) => field.onChange(Number.parseFloat(e.target
                                                                .value) || 0)
                                                            }
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Enhanced Add Product Row */}
                    <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => append({
                                name: "",
                                description: "",
                                quantity: 1,
                                unitPrice: 0,
                            })
                            }
                            className="w-full border-2 border-dashed border-gray-400 text-gray-600 hover:bg-white hover:border-primary hover:text-primary transition-all duration-200 rounded-xl font-semibold"
                        >
                            <Plus className="h-4 w-4 mr-3" />
                            Agregar Producto Químico
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

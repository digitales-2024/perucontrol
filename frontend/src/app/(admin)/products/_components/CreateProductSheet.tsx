"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFieldArray, useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterProduct } from "../actions";
import { toastWrapper } from "@/types/toasts";
import { useRouter } from "next/navigation";
import { CreateProductSchema, productSchema } from "../schemas";
import { Plus, Trash2 } from "lucide-react";

interface CreateProductSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const CreateProductSheet = ({ open, onOpenChange }: CreateProductSheetProps) =>
{
    const router = useRouter();

    const form = useForm<CreateProductSchema>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: "",
            activeIngredient: "",
            solvents: [""],
        },
    });

    const { reset } = form;

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "solvents" as never,
    });

    const onSubmit = async(input: CreateProductSchema) =>
    {
        const [, error] = await toastWrapper(RegisterProduct(input), {
            loading: "Registrando producto...",
            success: "Producto registrado exitosamente!",
        });
        if (error !== null) return;

        reset();
        onOpenChange(false);
        router.refresh();
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[540px] bg-white rounded-l-lg shadow-xl">
                <SheetHeader className="border-b border-gray-100 pb-4">
                    <SheetTitle className="text-xl font-semibold text-gray-800">
                        Nuevo Producto
                    </SheetTitle>
                </SheetHeader>

                <div className=" px-5">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Nombre del Producto */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-gray-700">
                                            Nombre del Producto
                                            <span className="text-red-500 ml-1">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ingrese el nombre del producto"
                                                {...field}
                                                className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs text-red-600" />
                                    </FormItem>
                                )}
                            />

                            {/* Ingrediente Activo */}
                            <FormField
                                control={form.control}
                                name="activeIngredient"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-gray-700">
                                            Ingrediente Activo
                                            <span className="text-red-500 ml-1">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ingrese el ingrediente activo"
                                                {...field}
                                                className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs text-red-600" />
                                    </FormItem>
                                )}
                            />

                            {/* Sección de Solventes */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                    <FormLabel className="text-sm font-medium text-gray-700">
                                        Cantidad y Contentraciones
                                    </FormLabel>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => append("")}
                                        className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Agregar
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="flex items-center gap-2 group">
                                            <FormField
                                                control={form.control}
                                                name={`solvents.${index}`}
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormControl>
                                                            <Input
                                                                placeholder={`Concentración ${index + 1}`}
                                                                {...field}
                                                                className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="text-xs text-red-600" />
                                                    </FormItem>
                                                )}
                                            />
                                            {index > 0 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => remove(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <SheetFooter className="pt-4 border-t border-gray-100">
                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-sm"
                                >
                                    Guardar Producto
                                </Button>
                            </SheetFooter>
                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet>
    );
};

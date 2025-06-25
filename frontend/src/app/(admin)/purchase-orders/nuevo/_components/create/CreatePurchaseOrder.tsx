"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
    CreatePurchaseOrderSchema,
    purchaseOrderSchema,
} from "../../../_schemas/createPurchaseOrdesSchema";
import CreateHeaderPurchaseOrder from "./CreateHeaderPurchaseOrder";
import CreateProductTablePurchaseOrder from "./CreateProductTablePurchaseOrder";
import { Separator } from "@/components/ui/separator";
import { toastWrapper } from "@/types/toasts";
import { RegisterPurchaseOrder } from "../../../_actions/PurchaseOrdersActions";

export default function CreatePurchaseOrder()
{
    const router = useRouter();
    const form = useForm<CreatePurchaseOrderSchema>({
        resolver: zodResolver(purchaseOrderSchema),
        defaultValues: {
            supplierId: "",
            issueDate: new Date().toISOString()
                .split("T")[0],
            currency: "PEN",
            paymentMethod: "TRANSFER",
            durationDays: 30,
            expirationDate: "",
            products: [
                { name: "", description: "", quantity: 1, unitPrice: 0 },
            ],
            subtotal: 0,
            vat: 0,
            total: 0,
            termsAndConditions:
				"Los productos químicos deben ser almacenados según las especificaciones técnicas. El proveedor garantiza la calidad y pureza de los componentes activos. Entrega en instalaciones del cliente con certificación de seguridad.",
        },
    });

    const watchedProducts = form.watch("products");
    const watchedCurrency = form.watch("currency");

    const subtotal = watchedProducts.reduce(
        (sum, product) => sum + ((product.quantity || 0) * (product.unitPrice || 0)),
        0,
    );

    const vat = subtotal * 0.18;
    const total = subtotal + vat;

    React.useEffect(() =>
    {
        form.setValue("subtotal", subtotal);
        form.setValue("vat", vat);
        form.setValue("total", total);
    }, [subtotal, vat, total, form]);

    const onSubmit = async(values: CreatePurchaseOrderSchema) =>
    {
        const currencyMap = { PEN: 0, USD: 1 };
        const paymentMethodMap = { TRANSFER: 0, CASH: 1 };

        const input = {
            ...values,
            currency: currencyMap[values.currency as "PEN" | "USD"],
            paymentMethod:
				paymentMethodMap[values.paymentMethod as "TRANSFER" | "CASH"],
            // Si tus productos no tienen id, puedes mapearlos así:
            products: values.products.map((p) => ({ ...p, id: null })),
        };

        const [, error] = await toastWrapper(RegisterPurchaseOrder(input), {
            loading: "Registrando orden...",
            success: "¡Orden registrada exitosamente!",
        });

        if (error !== null)
        {
            return;
        }

        form.reset();
        router.push("/purchase-orders");
    };

    const setDuration = (days: number) =>
    {
        form.setValue("durationDays", days);
        const issueDate = new Date(form.getValues("issueDate"));
        const expirationDate = new Date(issueDate);
        expirationDate.setDate(expirationDate.getDate() + days);
        form.setValue(
            "expirationDate",
            expirationDate.toISOString().split("T")[0],
        );
    };

    return (
        <div>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6 mt-5 ml-3"
                >
                    {/* Main Content */}
                    <div className="space-y-4">
                        {/* Enhanced Header Information Section */}
                        <CreateHeaderPurchaseOrder
                            form={form}
                            setDuration={setDuration}
                        />
                        {/* Enhanced Products Section */}
                        <CreateProductTablePurchaseOrder
                            form={form}
                            watchedCurrency={watchedCurrency}
                        />

                        {/* Enhanced Footer Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            {/* Enhanced Terms */}
                            <div className="lg:col-span-2 space-y-4">
                                <div className="flex items-center">
                                    <div className="w-1 h-12 bg-gradient-to-b from-primary/80 to-emerald-500 rounded-full mr-6" />
                                    <h3 className="text-gray-900">
                                        TÉRMINOS Y CONDICIONES
                                    </h3>
                                </div>
                                <FormField
                                    control={form.control}
                                    name="termsAndConditions"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Especifique las condiciones de seguridad y manejo..."
                                                    className="min-h-40 border-2 border-gray-200 rounded-xl"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription className="mt-3 text-gray-600">
                                                Máximo 1000 caracteres
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Enhanced Totals */}
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <div className="w-1 h-12 bg-gradient-to-b from-primary/80 to-emerald-500 rounded-full mr-6" />
                                    <h3 className="text-gray-900">
                                        RESUMEN
                                    </h3>
                                </div>
                                <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border-2 border-gray-200">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-gray-600">
                                            <span>
                                                Subtotal:
                                            </span>
                                            <span className="font-medium">
                                                {watchedCurrency === "PEN"
                                                    ? "S/."
                                                    : "US$"}
                                                {" "}
                                                {subtotal.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-gray-600">
                                            <span>
                                                IGV (18%):
                                            </span>
                                            <span className="font-medium">
                                                {watchedCurrency === "PEN"
                                                    ? "S/."
                                                    : "US$"}
                                                {" "}
                                                {vat.toFixed(2)}
                                            </span>
                                        </div>

                                        <Separator className="my-4" />
                                        <div>
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium text-gray-900">
                                                    TOTAL:
                                                </span>
                                                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                                                    {watchedCurrency === "PEN"
                                                        ? "S/."
                                                        : "US$"}
                                                    {" "}
                                                    {total.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Submit Button */}
                        <div className="mt-16 text-center">
                            <Button
                                type="submit"
                                size="lg"
                                className="bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white px-16 py-6 font-semibold rounded-2xl transition-all duration-300 hover:scale-105"
                            >
                                <Package className="w-7 h-7 mr-4" />
                                GENERAR ORDEN DE COMPRA
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
}

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
import { Separator } from "@/components/ui/separator";
import { toastWrapper } from "@/types/toasts";
import { UpdatePurchaseOrder } from "../../../_actions/PurchaseOrdersActions";
import { PurchaseOrder } from "../../../_types/PurchaseOrders";
import CreateHeaderPurchaseOrder from "../../../nuevo/_components/create/CreateHeaderPurchaseOrder";
import CreateProductTablePurchaseOrder from "../../../nuevo/_components/create/CreateProductTablePurchaseOrder";

interface UpdatePurchaseOrderProps {
    purchaseOrderId: string;
    purchaseOrder: PurchaseOrder
}

export default function UpdatePurchaseOrderComponent({purchaseOrderId, purchaseOrder}: UpdatePurchaseOrderProps)
{
    console.log("UpdatePurchaseOrder", JSON.stringify(purchaseOrder, null, 2));
    const router = useRouter();
    // Mapear currency y paymentMethod a string para el formulario
    const currencyMap = { 0: "PEN", 1: "USD" };
    const paymentMethodMap = { 0: "TRANSFER", 1: "CASH" };

    const form = useForm<CreatePurchaseOrderSchema>({
        resolver: zodResolver(purchaseOrderSchema),
        defaultValues: {
            supplierId: purchaseOrder.supplierId || "",
            issueDate: purchaseOrder.issueDate
                ? purchaseOrder.issueDate.split("T")[0]
                : new Date().toISOString()
                    .split("T")[0],
            currency: currencyMap[purchaseOrder.currency as 0 | 1] as "PEN" | "USD" || "PEN",
            paymentMethod: paymentMethodMap[purchaseOrder.paymentMethod as 0 | 1] as "TRANSFER" | "CASH" || "TRANSFER",
            durationDays: purchaseOrder.durationDays || 30,
            expirationDate: purchaseOrder.expirationDate
                ? purchaseOrder.expirationDate.split("T")[0]
                : "",
            products: purchaseOrder.products?.length
                ? purchaseOrder.products.map((p) => ({
                    name: p.name,
                    description: p.description ?? "",
                    quantity: p.quantity,
                    unitPrice: p.unitPrice,
                }))
                : [{ name: "", description: "", quantity: 1, unitPrice: 0 }],
            subtotal: purchaseOrder.subtotal || 0,
            vat: purchaseOrder.vat || 0,
            total: purchaseOrder.total || 0,
            termsAndConditions: purchaseOrder.termsAndConditions || "",
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

        const [, error] = await toastWrapper(UpdatePurchaseOrder(purchaseOrderId,input), {
            loading: "Actualizando orden...",
            success: "¡Orden actualizada exitosamente!",
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
                                <div className="bg-gradient-to-br from-transparent to-gray-100 p-6 rounded-2xl border-2 border-gray-200">
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
                                ACTUALIZAR ORDEN DE COMPRA
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
}

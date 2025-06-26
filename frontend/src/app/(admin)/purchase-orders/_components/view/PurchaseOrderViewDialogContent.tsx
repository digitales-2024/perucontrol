
import { Separator } from "@/components/ui/separator";
import {
    Building2,
    Calendar,
    DollarSign,
    FileText,
    Mail,
    MapPin,
    Package,
    Phone,
    Timer,
    ShoppingCart,
    TrendingUp,
} from "lucide-react";
import { PurchaseOrder } from "../../_types/PurchaseOrders";
import { formatDate, getCurrencyInfo, getPaymentMethodInfo} from "../../_utils/purchaseOrders.utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface PurchaseOrderViewDialogContentProps {
    order: PurchaseOrder;
}

export default function PurchaseOrderViewDialogContent({order}: PurchaseOrderViewDialogContentProps)
{
    const currencyInfo = getCurrencyInfo(order.currency);
    const paymentMethodInfo = getPaymentMethodInfo(order.paymentMethod);
    const PaymentIcon = paymentMethodInfo.icon;

    const isExpired = new Date(order.expirationDate) < new Date();
    const daysUntilExpiration = Math.ceil((new Date(order.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return (
        <>
            {/* Layout Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Información del Proveedor */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                        <div className="p-4 py-3 border-b border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                    <Building2 className="h-4 w-4 text-white" />
                                </div>
                                <h2 className="font-semibold text-slate-900">
                                    Información del Proveedor
                                </h2>
                            </div>
                        </div>
                        <div className="py-4 px-5 space-y-3">
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-2">
                                    Razón Social
                                </p>
                                <p className="font-medium text-slate-900">
                                    {order.supplier?.businessName}
                                </p>
                                <p className="text-sm text-slate-600 mt-1">
                                    {order?.supplier?.businessType}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-2">
                                    RUC
                                </p>
                                <p className="font-medium text-slate-900">
                                    {order.supplier?.rucNumber}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-2">
                                    Contacto
                                </p>
                                <p className="font-medium text-slate-900">
                                    {order.supplier?.contactName}
                                </p>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-slate-500 shrink-0" />
                                    <span className="text-sm text-slate-900">
                                        {order.supplier?.email}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-slate-500 shrink-0" />
                                    <span className="text-sm text-slate-900">
                                        {order.supplier?.phoneNumber}
                                    </span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                                    <span className="text-sm text-slate-900 leading-relaxed">
                                        {order.supplier?.fiscalAddress}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detalles y Resumen */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Detalles de la Orden */}
                    <div className="rounded-xl border border-slate-200 shadow-sm">
                        <div className="p-4 py-3 border-b border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                    <FileText className="h-4 w-4 text-white" />
                                </div>
                                <h2 className="font-semibold text-slate-900">
                                    Detalles de la Orden
                                </h2>
                            </div>
                        </div>
                        <div className="p-4 py-3">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 content-center">
                                <div className="text-center">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                        <Calendar className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                                        Emisión
                                    </p>
                                    <p className="font-medium text-slate-900">
                                        {formatDate(order.issueDate)}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                        <Timer className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                                        Vencimiento
                                    </p>
                                    <p className="font-medium text-slate-900">
                                        {formatDate(order.expirationDate)}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                        <DollarSign className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                                        Moneda
                                    </p>
                                    <p className="font-medium text-slate-900">
                                        {currencyInfo.name}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                        <PaymentIcon className="h-4 w-4 text-orange-600" />
                                    </div>
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                                        Pago
                                    </p>
                                    <p className="font-medium text-slate-900">
                                        {paymentMethodInfo.label}
                                    </p>
                                </div>
                                <div className="text-center md:col-span-1 md:col-start-2 justify-self-center">
                                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                        <Calendar className="h-4 w-4 text-indigo-600" />
                                    </div>
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                                        Duración
                                    </p>
                                    <p className="font-medium text-slate-900">
                                        {order.durationDays}
                                        {" "}
                                        días
                                    </p>
                                </div>
                                <div className="text-center">
                                    <div
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-3 ${
                                            isExpired
                                                ? "bg-red-100"
                                                : daysUntilExpiration <= 3
                                                    ? "bg-amber-100"
                                                    : "bg-slate-100"
                                        }`}
                                    >
                                        <Calendar className={`h-4 w-4 ${
                                            isExpired
                                                ? "text-red-600"
                                                : daysUntilExpiration <= 3
                                                    ? "text-amber-600"
                                                    : "text-slate-600"
                                        }`}
                                        />
                                    </div>
                                    <p
                                        className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1"
                                    >
                                        {isExpired ? "Estado" : "Vencimiento"}

                                    </p>
                                    <p
                                        className={`font-medium ${
                                            isExpired
                                                ? "text-red-600"
                                                : daysUntilExpiration <= 3
                                                    ? "text-amber-600"
                                                    : "text-slate-900"
                                        }`}
                                    >
                                        {isExpired ? "Orden Vencida" : `${daysUntilExpiration} días restantes`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resumen Financiero */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                        <div className="p-4 py-3 border-b border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                    <TrendingUp className="h-4 w-4 text-white" />
                                </div>
                                <h2 className="font-semibold text-slate-900">
                                    Resumen Financiero
                                </h2>
                            </div>
                        </div>
                        <div className="p-4 py-3">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600">
                                        Subtotal
                                    </span>
                                    <span className="font-medium text-slate-900">
                                        {currencyInfo.symbol}
                                        {" "}
                                        {order.subtotal.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600">
                                        IGV (18%)
                                    </span>
                                    <span className="font-medium text-slate-900">
                                        {currencyInfo.symbol}
                                        {" "}
                                        {order.vat.toLocaleString()}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center py-3 bg-emerald-50 px-6 rounded-lg">
                                    <span className="text-lg font-semibold text-emerald-900">
                                        Total
                                    </span>
                                    <span className="text-xl font-bold text-emerald-900">
                                        {currencyInfo.symbol}
                                        {" "}
                                        {order.total.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Productos */}
            <div className="rounded-xl border border-slate-200 shadow-sm">
                <div className="p-4 py-3 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <ShoppingCart className="h-4 w-4 text-white" />
                        </div>
                        <h2 className="font-semibold text-slate-900">
                            Productos (
                            {order.products.length}
                            {" "}
                            {order.products.length === 1 ? "producto" : "productos"}
                            )
                        </h2>
                    </div>
                </div>
                <div className="overflow-x-auto grid grid-cols-1">
                    <ScrollArea>
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="text-left py-4 px-6 font-medium text-slate-600">
                                        Producto
                                    </th>
                                    <th className="text-left py-4 px-6 font-medium text-slate-600">
                                        Descripción
                                    </th>
                                    <th className="text-right py-4 px-6 font-medium text-slate-600">
                                        Cantidad
                                    </th>
                                    <th className="text-right py-4 px-6 font-medium text-slate-600">
                                        Precio Unitario
                                    </th>
                                    <th className="text-right py-4 px-6 font-medium text-slate-600">
                                        Subtotal
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.products.map((product, index) => (
                                    <tr key={product.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <Package className="h-4 w-4 text-primary" />
                                                </div>
                                                <span className="font-medium text-slate-900">
                                                    {product.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-slate-900">
                                            {product.description ?? "-"}
                                        </td>
                                        <td className="py-4 px-6 text-right font-medium text-slate-900">
                                            {product.quantity}
                                        </td>
                                        <td className="py-4 px-6 text-right font-medium text-slate-900">
                                            {currencyInfo.symbol}
                                            {" "}
                                            {product.unitPrice.toLocaleString()}
                                        </td>
                                        <td className="py-4 px-6 text-right font-medium text-slate-900">
                                            {currencyInfo.symbol}
                                            {" "}
                                            {(product.quantity * product.unitPrice).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <ScrollBar orientation="horizontal" className="h-2 bg-slate-200 rounded-full mt-2" />

                    </ScrollArea>
                </div>
            </div>

            {/* Términos y Condiciones */}
            <div className="rounded-xl border border-slate-200 shadow-sm">
                <div className="p-4 py-3 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <FileText className="h-4 w-4 text-white" />
                        </div>
                        <h2 className="font-semibold text-slate-900">
                            Términos y Condiciones
                        </h2>
                    </div>
                </div>
                <div className="p-4 py-3">
                    <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {order.termsAndConditions}
                        </p>
                    </div>
                </div>
            </div>
        </>

    );
}

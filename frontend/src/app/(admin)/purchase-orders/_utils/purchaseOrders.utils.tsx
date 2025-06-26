import { formatInTimeZone } from "date-fns-tz";
import { parseISO } from "date-fns";
import { PurchaseOrderCurrency, PurchaseOrderPaymentMethod, PurchaseOrderStatus } from "../_types/PurchaseOrders";
import { AlertCircle, CheckCircle, CreditCard, HandCoins, XCircle } from "lucide-react";

export const formatDate = (dateString: string) =>
{
    const date = parseISO(dateString);
    return formatInTimeZone(date, "UTC", "dd/MM/yyyy");
};

export const formatDateTime = (dateString: string) =>
{
    const date = parseISO(dateString);
    return formatInTimeZone(date, "UTC", "dd/MM/yyyy HH:mm");
};

export const getStatusConfig = (status: PurchaseOrderStatus) =>
{
    const statusMap = {
        [PurchaseOrderStatus.Pending]: {
            label: "Pendiente",
            icon: AlertCircle,
            color: "text-amber-600",
            bg: "bg-amber-50",
            border: "border-amber-200",
            dot: "bg-amber-500",
        },
        [PurchaseOrderStatus.Accepted]: {
            label: "Aceptada",
            icon: CheckCircle,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-200",
            dot: "bg-emerald-500",
        },
        [PurchaseOrderStatus.Cancelled]: {
            label: "Cancelada",
            icon: XCircle,
            color: "text-red-600",
            bg: "bg-red-50",
            border: "border-red-200",
            dot: "bg-red-500",
        },
    };

    return (
        statusMap[status] || {
            label: "Desconocido",
            icon: AlertCircle,
            color: "text-gray-600",
            bg: "bg-gray-50",
            border: "border-gray-200",
            dot: "bg-gray-500",
        }
    );
};

export const getCurrencyInfo = (currency: PurchaseOrderCurrency) =>
{
    const currencyMap = {
        [PurchaseOrderCurrency.PEN]: { symbol: "S/", name: "Soles Peruanos" },
        [PurchaseOrderCurrency.USD]: { symbol: "$", name: "Dólares Americanos" },
    };

    return currencyMap[currency] || { symbol: "S/", name: "Soles Peruanos" };
};

export const getPaymentMethodInfo = (paymentMethod: PurchaseOrderPaymentMethod) =>
{
    const paymentMethodMap = {
        [PurchaseOrderPaymentMethod.Transfer]: {
            label: "Transferencia Bancaria",
            icon: CreditCard,
        },
        [PurchaseOrderPaymentMethod.Cash]: {
            label: "Efectivo",
            icon: HandCoins,
        },
    };

    return (
        paymentMethodMap[paymentMethod] || {
            label: "Transferencia Bancaria",
            icon: CreditCard,
        }
    );
};

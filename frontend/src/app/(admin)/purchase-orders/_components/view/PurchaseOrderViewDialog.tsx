"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PurchaseOrder, PurchaseOrderStatus } from "../../_types/PurchaseOrders";
import { formatDate, getStatusConfig} from "../../_utils/purchaseOrders.utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import PurchaseOrderViewDialogContent from "./PurchaseOrderViewDialogContent";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Calendar, ChevronDown, Check, FileText } from "lucide-react";
import { ChangePurchaseOrderStatus } from "../../_actions/PurchaseOrdersActions";
import { toastWrapper } from "@/types/toasts";
import { useEffect, useState } from "react";

interface PurchaseOrderViewDialogProps {
  order: PurchaseOrder | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PurchaseOrderViewDialog({ order, open, onOpenChange }: PurchaseOrderViewDialogProps)
{
    const isDesktop = useMediaQuery("(min-width: 1400px)");
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    // Estado local SOLO para el status
    const [localStatus, setLocalStatus] = useState(order?.status);

    // Sincroniza si cambia la orden
    useEffect(() =>
    {
        setLocalStatus(order?.status);
    }, [order?.status]);

    const handleStatusChange = async(newStatus: PurchaseOrderStatus) =>
    {
        if (!order || newStatus === localStatus || isUpdatingStatus) return;

        setIsUpdatingStatus(true);

        const [, error] = await toastWrapper(
            ChangePurchaseOrderStatus(order.id ?? "", newStatus),
            {
                loading: `Actualizando estado de la orden #${order.number}...`,
                success: `Estado de la orden #${order.number} actualizado exitosamente`,
                error: (e) => `Error al actualizar estado: ${e.message}`,
            },
        );

        setIsUpdatingStatus(false);

        if (!error)
        {
            setLocalStatus(newStatus); // Actualiza solo el status local
        }
        else
        {
            console.error(`Error updating order ${order.id} status:`, error);
        }
    };
    if (!order) return null;

    const statusConfig = getStatusConfig(localStatus!);
    const StatusIcon = statusConfig.icon;

    if (isDesktop) return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl sm:px-0 sm:py-4">
                <DialogHeader className="relative border-b border-slate-200/60 px-4 pb-4 bg-gradient-to-r from-slate-50/50 to-white">
                    <div className="flex items-start justify-between gap-6">
                        <div className="flex-1 min-w-0 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-sm">
                                    <FileText className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex flex-row gap-2 items-center">
                                    <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">
                                        Orden de Compra
                                    </DialogTitle>
                                    <div className="text-lg font-mono font-semibold text-primary mt-0.5">
                                        #
                                        {order.number}
                                    </div>
                                </div>
                            </div>

                            <DialogDescription className="text-sm text-slate-600 flex items-center gap-2 ml-13">
                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                                <Calendar className="h-4 w-4" />
                                <span>
                                    Emitida el
                                    {" "}
                                    {" "}
                                    {formatDate(order.issueDate)}
                                </span>
                            </DialogDescription>
                        </div>

                        <div className="flex flex-col items-end gap-3 mt-5">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className={`flex items-center gap-3 px-4 py-1 rounded-xl ${statusConfig.bg} ${statusConfig.border} border-2 hover:shadow-md hover:scale-105 transition-all duration-200 group min-w-[140px]`}>
                                        <div className="flex items-center gap-2">
                                            <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                                Estado
                                            </span>
                                            <span className={`font-semibold text-sm ${statusConfig.color} leading-tight`}>
                                                {statusConfig.label}
                                            </span>
                                        </div>
                                        <ChevronDown className={`h-4 w-4 ${statusConfig.color} group-hover:rotate-180 transition-transform duration-200 ml-auto`} />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 p-2">
                                    <DropdownMenuLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
                                        Cambiar Estado de la Orden
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="my-2" />
                                    {Object.values(PurchaseOrderStatus).filter((status) => typeof status === "number")
                                        .map((status) =>
                                        {
                                            const config = getStatusConfig(status as PurchaseOrderStatus);
                                            const ConfigIcon = config.icon;
                                            const isCurrentStatus = status === localStatus;

                                            return (
                                                <DropdownMenuItem
                                                    key={status}
                                                    className={`flex items-center gap-3 py-3 px-3 rounded-lg cursor-pointer transition-all duration-150 ${
                                                        isCurrentStatus
                                                            ? "bg-slate-100 cursor-default"
                                                            : "hover:bg-slate-50 hover:scale-[1.02]"
                                                    }`}
                                                    disabled={isCurrentStatus}
                                                    onClick={() => handleStatusChange(status as PurchaseOrderStatus)}
                                                >
                                                    <div className={`w-3 h-3 rounded-full ${config.dot} ${!isCurrentStatus ? "animate-pulse" : ""}`} />
                                                    <ConfigIcon className={`h-5 w-5 ${config.color}`} />
                                                    <div className="flex flex-col flex-1">
                                                        <span className={`font-semibold text-sm ${config.color}`}>
                                                            {config.label}
                                                        </span>
                                                        <span className="text-xs text-slate-500">
                                                            {status === PurchaseOrderStatus.Pending && "En espera de respuesta"}
                                                            {status === PurchaseOrderStatus.Accepted && "Confirmada y aprobada"}
                                                            {status === PurchaseOrderStatus.Cancelled && "Cancelada definitivamente"}
                                                        </span>
                                                    </div>
                                                    {isCurrentStatus && (
                                                        <div className="flex items-center gap-1">
                                                            <Check className="h-4 w-4 text-emerald-500" />
                                                            <span className="text-xs font-medium text-emerald-600">
                                                                Actual
                                                            </span>
                                                        </div>
                                                    )}
                                                </DropdownMenuItem>
                                            );
                                        })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="h-full max-h-[75vh] px-0">
                    <div className="px-6 space-y-8">
                        <PurchaseOrderViewDialogContent order={order} />
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="h-[80vh]">
                <DrawerHeader className="relative border-b border-slate-200/60 px-4 py-2 bg-gradient-to-r from-slate-50/30 to-white">
                    <div className="space-y-4 flex flex-col sm:flex-row items-center justify-between">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-sm">
                                    <FileText className="h-4 w-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <DrawerTitle className="text-lg font-bold text-slate-900 tracking-tight truncate">
                                        Orden de Compra #
                                        {order.number}
                                    </DrawerTitle>
                                    <DrawerDescription className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                                        <Calendar className="h-3 w-3" />
                                        <span>
                                            Emitida el
                                            {formatDate(order.issueDate)}
                                        </span>
                                    </DrawerDescription>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className={`flex items-center gap-2 px-3 py-1 rounded-lg ${statusConfig.bg} ${statusConfig.border} border-2 hover:shadow-md transition-all duration-200 group`}>
                                        <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
                                        <div className="flex flex-col items-start">
                                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide leading-none">
                                                Estado
                                            </span>
                                            <span className={`font-semibold text-sm ${statusConfig.color} leading-tight`}>
                                                {statusConfig.label}
                                            </span>
                                        </div>
                                        <ChevronDown className={`h-3 w-3 ${statusConfig.color} group-hover:rotate-180 transition-transform duration-200`} />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52 p-2">
                                    <DropdownMenuLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
                                        Cambiar Estado
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="my-2" />
                                    {Object.values(PurchaseOrderStatus).filter((status) => typeof status === "number")
                                        .map((status) =>
                                        {
                                            const config = getStatusConfig(status as PurchaseOrderStatus);
                                            const ConfigIcon = config.icon;
                                            const isCurrentStatus = status === localStatus;

                                            return (
                                                <DropdownMenuItem
                                                    key={status}
                                                    className={`flex items-center gap-3 py-2.5 px-3 rounded-lg cursor-pointer transition-all duration-150 ${
                                                        isCurrentStatus
                                                            ? "bg-slate-100 cursor-default"
                                                            : "hover:bg-slate-50"
                                                    }`}
                                                    disabled={isCurrentStatus}
                                                    onClick={() => handleStatusChange(status as PurchaseOrderStatus)}
                                                >
                                                    <div className={`w-2.5 h-2.5 rounded-full ${config.dot} ${!isCurrentStatus ? "animate-pulse" : ""}`} />
                                                    <ConfigIcon className={`h-4 w-4 ${config.color}`} />
                                                    <div className="flex flex-col flex-1">
                                                        <span className={`font-semibold text-sm ${config.color}`}>
                                                            {config.label}
                                                        </span>
                                                    </div>
                                                    {isCurrentStatus && (
                                                        <Check className="h-4 w-4 text-emerald-500" />
                                                    )}
                                                </DropdownMenuItem>
                                            );
                                        })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </DrawerHeader>

                {/* The key fix is in this ScrollArea configuration */}
                <div className="flex-1 overflow-hidden mt-4">
                    <ScrollArea className="h-full px-0">
                        <div className="px-4 pb-4 space-y-8">
                            <PurchaseOrderViewDialogContent order={order} />
                        </div>
                    </ScrollArea>
                </div>
            </DrawerContent>
        </Drawer>
    );
}

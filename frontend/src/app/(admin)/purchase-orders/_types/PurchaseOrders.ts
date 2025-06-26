import { components } from "@/types/api";

export type PurchaseOrder = components["schemas"]["PurchaseOrder"];

export enum PurchaseOrderStatus {
	Pending = 0, // Pendiente
	Accepted = 1, // Aceptada
	Cancelled = 2, // Cancelada
}

export enum PurchaseOrderCurrency {
	PEN = 0, // Peruvian Sol (S/.)
	USD = 1, // US Dollar (US$)
}

export enum PurchaseOrderPaymentMethod {
	Transfer = 0, // Transferencia
	Cash = 1, // Efectivo
}

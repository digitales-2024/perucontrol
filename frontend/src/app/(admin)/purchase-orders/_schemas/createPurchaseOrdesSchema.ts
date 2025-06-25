import * as z from "zod";

export const purchaseOrderSchema = z.object({
    supplierId: z.string().uuid("Debe seleccionar un proveedor válido"),
    issueDate: z.string().min(1, "La fecha de emisión es requerida"),
    currency: z.enum(["PEN", "USD"], {
        required_error: "Debe seleccionar una moneda",
    }),
    paymentMethod: z.enum(["TRANSFER", "CASH"], {
        required_error: "Debe seleccionar un método de pago",
    }),
    durationDays: z.number().min(1, "Mínimo 1 día")
        .max(365, "Máximo 365 días"),
    expirationDate: z.string().min(1, "La fecha de vencimiento es requerida"),
    products: z
        .array(z.object({
            name: z.string().min(1, "El nombre del producto es requerido"),
            description: z.string().min(1, "La descripción es requerida"),
            quantity: z.number().min(1, "La cantidad debe ser mayor a 0"),
            unitPrice: z
                .number()
                .min(0, "El precio debe ser mayor o igual a 0"),
        }))
        .min(1, "Debe agregar al menos un producto"),
    subtotal: z.number().min(0),
    vat: z.number().min(0),
    total: z.number().min(0),
    termsAndConditions: z.string().max(1000, "Máximo 1000 caracteres"),
});

export type CreatePurchaseOrderSchema = z.infer<typeof purchaseOrderSchema>;

import * as z from "zod";

export const quotationSchema = z.object({
    clientId: z.string().min(5, "El cliente es requerido")
        .uuid("Formato de ID inválido"),
    serviceIds: z.array(z.string().min(1, "El servicio es requerido")),
    frequency: z.enum(["Bimonthly", "Quarterly", "Semiannual"]),
    area: z.preprocess(
        (val) => (typeof val === "string" ? parseInt(val, 10) : val),
        z
            .number()
            .int("El área debe ser un número entero")
            .gte(1, { message: "El área debe ser al menos 1" })
            .lte(4294967295, { message: "El área debe ser menor o igual a 4294967295" }),
    ),
    spacesCount: z.preprocess(
        (val) => (typeof val === "string" ? parseInt(val, 10) : val),
        z
            .number()
            .int("La cantidad debe ser un número entero")
            .min(1, { message: "La cantidad debe ser al menos 1" }),
    ),
    hasTaxes: z.boolean(),
    termsAndConditions: z.string().min(3, "Los términos y condiciones son requeridos"),
    creationDate: z.string().min(5, "La fecha de creación es requerida"),
    expirationDate: z.string().min(5, "La fecha de expiración es requerida"),
    serviceAddress: z.string().min(3, "La dirección del servicio es requerida"),
    paymentMethod: z.string().min(3, "El método de pago es requerido"),
    others: z.string(),
    serviceListText: z.string().min(3, "La lista de servicios es requerida"),
    serviceDescription: z.string().min(3, "La descripción del servicio es requerida"),
    serviceDetail: z.string().min(3, "El detalle del servicio es requerido"),
    price: z.preprocess(
        (val) => (typeof val === "string" ? parseFloat(val) : val),
        z
            .number()
            .min(0, { message: "El precio debe ser un valor positivo" }),
    ),
    requiredAvailability: z.string().min(3, "La disponibilidad requerida es necesaria"),
    serviceTime: z.string().min(3, "El tiempo de servicio es requerido"),
    customField6: z.string(),
    treatedAreas: z.string().min(3, "Las áreas tratadas son requeridas"),
    deliverables: z.string().min(3, "Los entregables son requeridos"),
    customField10: z.string().optional(),
});

export type CreateQuotationSchema = z.infer<typeof quotationSchema>;

export const quotationDownloadSchema = z.object({
    validUntil: z.string().min(5, "El campo es requerido"),
    guarantee: z.string().min(5, "El campo es requerido"),
    deliverables: z.string().min(5, "El campo es requerido"),
});

export type DownloadQuotationSchema = z.infer<typeof quotationDownloadSchema>;

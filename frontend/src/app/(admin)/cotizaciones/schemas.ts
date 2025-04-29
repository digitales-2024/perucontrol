import * as z from "zod";

export const quotationSchema = z.object({
    clientId: z.string().min(1, "El cliente es requerido")
        .uuid("Formato de ID inválido"),
    serviceIds: z.array(z.string().min(1, "El servicio es requerido"))
        .nonempty("Los servicios son obligatorios y no pueden estar vacío"),
    frequency: z.enum(["Monthly", "Fortnightly", "Bimonthly", "Quarterly", "Semiannual"]),
    hasTaxes: z.boolean(),
    creationDate: z.string().min(1, "La fecha de creación es requerida"),
    expirationDate: z.string().min(1, "La fecha de expiración es requerida"),
    serviceAddress: z.string().min(1, "La dirección del servicio es requerida"),
    paymentMethod: z.string().min(1, "El método de pago es requerido"),
    others: z.string(),
    availability: z.string().min(1, "La disponibilidad es necesaria"),
    quotationServices: z.array(z.object({
        id: z.string().nullable()
            .optional(),
        amount: z.number().int()
            .min(1),
        nameDescription: z.string().min(1, "Name and description of the service"),
        price: z.number().optional(),
        accesories: z.string().optional(),
    })),
    desinsectant: z.string(),
    derodent: z.string(),
    disinfectant: z.string(),
    termsAndConditions: z.array(z.string().min(1, "La lista de términos y condiciones es obligatoria")),
});

export type CreateQuotationSchema = z.infer<typeof quotationSchema>;

export const quotationDownloadSchema = z.object({
    validUntil: z.string().min(1, "El campo es requerido"),
    guarantee: z.string().min(1, "El campo es requerido"),
    deliverables: z.string().min(1, "El campo es requerido"),
});

export type DownloadQuotationSchema = z.infer<typeof quotationDownloadSchema>;

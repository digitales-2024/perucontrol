import * as z from "zod";

export const quotationSchema = z.object({
    clientId: z.string().min(5, "El cliente es requerido"),
    serviceIds: z.array(z.string().min(1, "El servicio es requerido")),
    description: z.string().min(3, "La descripción es requerida"),
    area: z.preprocess(
        (val) => (typeof val === "string" ? parseInt(val, 10) : val),
        z
            .number()
            .gte(1, { message: "El área debe ser al menos 1" })
            .lte(4294967295, { message: "El área debe ser menor o igual a 4294967295" }),
    ),
    spacesCount: z.preprocess(
        (val) => (typeof val === "string" ? parseInt(val, 10) : val),
        z
            .number()
            .min(1, { message: "La cantidad debe ser al menos 1" }),
    ),
    hasTaxes: z.boolean(),
    termsAndConditions: z.string().min(3, "Los términos y condiciones son requeridos"),

});

export type CreateQuotationSchema = z.infer<typeof quotationSchema>;

export const quotationDownloadSchema = z.object({
    validUntil: z.string().min(5, "El campo es requerido"),
    guarantee: z.string().min(5, "El campo es requerido"),
    deliverables: z.string().min(5, "El campo es requerido"),
});

export type DownloadQuotationSchema = z.infer<typeof quotationDownloadSchema>;

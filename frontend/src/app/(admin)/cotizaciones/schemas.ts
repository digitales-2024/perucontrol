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
    footerContact: z.string().optional(),
    quotationServices: z.array(z.object({
        id: z.string().nullable()
            .optional(),
        amount: z.string().min(1, { message: "La cantidad no puede estar vacía" }),
        nameDescription: z.string().min(1, "La descripción del servicio no puede estar vacía"),
        price: z.number().optional(),
        accesories: z.string().optional(),
    })),
    desinsectant: z.string(),
    derodent: z.string(),
    disinfectant: z.string(),
    termsAndConditions: z.array(z.string().min(1, "La lista de términos y condiciones es obligatoria")
        .optional()),
});

export type CreateQuotationSchema = z.infer<typeof quotationSchema>;

export const quotationDownloadSchema = z.object({
    validUntil: z.string().min(1, "El campo es requerido"),
    guarantee: z.string().min(1, "El campo es requerido"),
    deliverables: z.string().min(1, "El campo es requerido"),
});

export type DownloadQuotationSchema = z.infer<typeof quotationDownloadSchema>;

const clientLocationSchema = z.object({

    address: z.string().min(1, "La dirección es requerida")
        .max(250, "La dirección no puede exceder 250 caracteres"),
});

export const quotationSchema2 = z.object({
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
    footerContact: z.string().optional(),
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
    quotationNumber: z.number(),
    status: z.string(),
    isActive: z.boolean(),
    client: z.object({
        clientNumber: z.number().int()
            .max(2147483647, "El número de cliente debe ser un entero de 32 bits"),
        typeDocument: z.string().max(3, "El tipo de documento no puede exceder 3 caracteres"),
        typeDocumentValue: z.string().min(8, "El valor del documento debe tener al menos 8 caracteres")
            .max(11, "El valor del documento no puede exceder 11 caracteres"),
        razonSocial: z.string().max(150, "La razón social no puede exceder 150 caracteres")
            .nullable(),
        businessType: z.string().max(250, "El tipo de negocio no puede exceder 250 caracteres")
            .nullable(),
        name: z.string().min(1, "El nombre es requerido")
            .max(100, "El nombre no puede exceder 100 caracteres"),
        fiscalAddress: z.string().min(1, "La dirección fiscal es requerida")
            .max(250, "La dirección fiscal no puede exceder 250 caracteres"),
        email: z.string().min(3, "El correo electrónico es requerido")
            .max(50, "El correo electrónico no puede exceder 50 caracteres")
            .email("Formato de correo electrónico inválido"),
        clientLocations: z.array(clientLocationSchema).nonempty("Se requiere al menos una ubicación del cliente"),
        phoneNumber: z.string().min(6, "El número de teléfono es requerido")
            .max(24, "El número de teléfono no puede exceder 24 caracteres"),
        contactName: z.string().max(100, "El nombre de contacto no puede exceder 100 caracteres")
            .nullable(),
        id: z.string().uuid("Formato de ID inválido")
            .optional(),
        isActive: z.boolean(),
        createdAt: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Fecha de creación inválida" }),
        modifiedAt: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Fecha de modificación inválida" }),
    }),
    services: z.array(z.object({
        name: z.string()
            .min(2, "El nombre debe tener al menos 2 caracteres")
            .max(20, "El nombre no puede exceder 20 caracteres"),
        id: z.string().uuid("Formato de ID inválido")
            .optional(),
        isActive: z.boolean().optional(),
        createdAt: z.string()
            .refine((date) => !isNaN(Date.parse(date)), { message: "Fecha de creación inválida" }),
        modifiedAt: z.string()
            .refine((date) => !isNaN(Date.parse(date)), { message: "Fecha de modificación inválida" }),
    })),
});

export type CreateQuotationSchema2 = z.infer<typeof quotationSchema2>;

import { z } from "zod";

export const companyInfoSchema = z.object({
    digesaNumber: z.string().min(1, "El número de DIGESA es requerido"),
    address: z.string().min(1, "La dirección es requerida"),
    email: z.string().email("Correo electrónico inválido"),
    ruc: z.string().length(11, "El RUC debe tener 11 dígitos"),
    phones: z.string().min(1, "Al menos un número de teléfono es requerido"),
    directorName: z.string().min(1, "El nombre del director es requerido"),
    bankName: z.string().min(1, "El nombre del banco es requerido"),
    bankAccount: z.string().min(1, "El número de cuenta es requerido"),
    bankCCI: z.string().min(1, "El código CCI es requerido"),
    deductions: z.string().optional(),
    thechnicalDirectorName: z.string().min(1, "El nombre del Director Técnico es requerdio"),
    thechnicalDirectorPosition: z.string().min(1, "El cargo del Director Técnico es requerido"),
    thechnicalDirectorCIP: z.string().min(1, "El CIP del Director Técnico es requerido"),
    responsibleName: z.string().min(1, "El nombre del Responsable es requerido"),
    responsiblePosition: z.string().min(1, "El cargo del Responsable es requerido"),
    responsibleCIP: z.string().min(1, "El CIP del Responsable es requerido"),
});

export type CompanyInfoSchema = z.infer<typeof companyInfoSchema>;

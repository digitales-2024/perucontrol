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
});

export type CompanyInfoSchema = z.infer<typeof companyInfoSchema>;

import * as z from "zod";

export const supplierSchema = z.object({
    rucNumber: z.string()
        .length(11, "El RUC debe tener 11 dígitos")
        .nonempty("El RUC es requerido"),
    businessName: z.string(),
    businessType: z.string(),
    name: z.string().nonempty("El nombre es requerido"),
    fiscalAddress: z.string().nonempty("La dirección es requerida"),
    email: z.string().min(1, "El email es requerido")
        .email("El email no es válido"),
    contactName: z.string(),
    supplierLocations: z.array(z.object({
        address: z.string().nonempty("La dirección es requerida"),
    })),
    phoneNumber: z.string().nonempty("El número de teléfono es requerido"),
});

export type CreateSupplierSchema = z.infer<typeof supplierSchema>;
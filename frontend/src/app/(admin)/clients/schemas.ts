import * as z from "zod";

export const clientSchema = z.object({
    typeDocument: z.string().min(3, "El tipo de documento es requerido"),
    typeDocumentValue: z.string().min(8, "El valor es requerido"),
    razonSocial: z.string(),
    businessType: z.string().nonempty("El rubro es requerido"),
    name: z.string().nonempty("El nombre es requerido"),
    fiscalAddress: z.string().nonempty("La dirección es requerida"),
    email: z.string().email("El email no es válido"),
    clientLocations: z.array(z.object({
        address: z.string(),
    })),
    phoneNumber: z.string().nonempty("El número de teléfono es requerido"),
});

export type CreateClientSchema = z.infer<typeof clientSchema>;

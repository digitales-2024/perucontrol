import * as z from "zod";

export const clientSchema = z.object({
    typeDocument: z.string().min(1, "El tipo de documento es requerido"),
    typeDocumentValue: z.string().min(1, "El valor es requerido"),
    razonSocial: z.string(),
    businessType: z.string(),
    name: z.string().nonempty("El nombre es requerido"),
    fiscalAddress: z.string().nonempty("La dirección es requerida"),
    email: z.string().min(1, "El email es requerido")
        .email("El email no es válido"),
    contactName: z.string(),
    clientLocations: z.array(z.object({
        address: z.string(),
    })),
    phoneNumber: z.string().nonempty("El número de teléfono es requerido"),
});

export type CreateClientSchema = z.infer<typeof clientSchema>;

import * as z from "zod";

export const clientSchema = z.object({
    razonSocial: z.string().min(3, "La razón social es requerida"),
    businessType: z.string().nonempty("El tipo de documento es requerido"),
    name: z.string().nonempty("El nombre es requerido"),
    fiscalAddress: z.string().nonempty("La dirección es requerida"),
    email: z.string().email("El email no es válido"),
    clientLocations: z.array(z.object({
        address: z.string(),
    })),
    phoneNumber: z.string().nonempty("El número de documento es requerido"),
});

export type CreateClientSchema = z.infer<typeof clientSchema>;

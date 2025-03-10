import * as z from "zod";

export const clientDataSchema = z.object({
    clientId: z.string().min(1, "Debe seleccionar un cliente"),
    quotationId: z.string().nullable(),
    services: z.array(z.string().min(1, "El servicio es requerido")),
    address: z.string().min(1, "La dirección es requerida"),
    area: z.number().min(1, "El área debe ser mayor a 0"),
    spacesCount: z.number().min(1, "El número de ambientes debe ser mayor a 0"),
    orderNumber: z.number().min(1, "El número de ambientes debe ser mayor a 0"),
});

export type ClientDataSchema = z.infer<typeof clientDataSchema>

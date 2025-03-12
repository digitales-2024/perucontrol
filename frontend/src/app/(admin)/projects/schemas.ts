import * as z from "zod";

export const clientDataSchema = z.object({
    clientId: z.string().min(1, "Debe seleccionar un cliente"),
    quotationId: z.string().nullable(),
    services: z.array(z.string().min(1, "El servicio es requerido")),
    address: z.string().min(1, "La dirección es requerida"),
    area: z.number().min(1, "El área debe ser mayor a 0"),
    spacesCount: z.number().min(1, "El número de ambientes debe ser mayor a 0"),
});

export type ClientDataSchema = z.infer<typeof clientDataSchema>

export const downloadProjectSchema = z.object({
    date: z.string().min(5, "La fecha es requerida"),
    entryTime: z.string(),
    departureTime: z.string(),
    razonSocial: z.string().min(3, "La razón social es requerida"),
    address: z.string().min(3, "La dirección es requerida"),
    businessType: z.string().min(5, "El giro de negocio es requerdido"),
    healthCondition: z.string().min(5, "La condición sanitaria es requerida"),
    treatedAreas: z.string().min(5, "Las areas son necesarias"),
    service: z.string().min(5, "Los servicios son necesarios"),
    certificateNumber: z.string(),
    insects: z.string(),
    rodents: z.string(),
    others: z.string(),
    insecticide: z.string(),
    rodenticide: z.string(),
    disinfectant: z.string(),
    otherProducts: z.string(),
    amountInsecticide: z.number(),
    amountRodenticide: z.number(),
    amountDisinfectant: z.number(),
    amountOtherProducts: z.number(),
    ratExterminationMonitoring1: z.string(),
    ratExterminationMonitoring2: z.string(),
    ratExterminationMonitoring3: z.string(),
    ratExterminationMonitoring4: z.string(),
    staff1: z.string(),
    staff2: z.string(),
    staff3: z.string(),
    staff4: z.string(),
});

export type DownloadProjectSchema = z.infer<typeof downloadProjectSchema>;

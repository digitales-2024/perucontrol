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
    projectId: z.string(),
    operationDate: z.string(),
    enterTime: z.string(),
    leaveTime: z.string(),
    razonSocial: z.string(),
    address: z.string(),
    businessType: z.string(),
    sanitaryCondition: z.string(),
    treatedAreas: z.string(),
    service: z.array(z.string()),
    certificateNumber: z.string(),
    insects: z.string(),
    rodents: z.string(),
    otherPlagues: z.string(),
    insecticide: z.string(),
    insecticide2: z.string(),
    rodenticide: z.string(),
    desinfectant: z.string(),
    otherProducts: z.string(),
    insecticideAmount: z.string(),
    insecticideAmount2: z.string(),
    rodenticideAmount: z.string(),
    desinfectantAmount: z.string(),
    otherProductsAmount: z.string(),
    ratExtermination1: z.string(),
    ratExtermination2: z.string(),
    ratExtermination3: z.string(),
    ratExtermination4: z.string(),
    staff1: z.string(),
    staff2: z.string(),
    staff3: z.string(),
    staff4: z.string(),
    aspersionManual: z.boolean().optional()
        .default(false),
    aspersionMotor: z.boolean().optional()
        .default(false),
    nebulizacionFrio: z.boolean().optional()
        .default(false),
    nebulizacionCaliente: z.boolean().optional()
        .default(false),
    nebulizacionCebosTotal: z.boolean().optional()
        .default(false),
    colocacionCebosCebaderos: z.boolean().optional()
        .default(false),
    colocacionCebosRepuestos: z.boolean().optional()
        .default(false),
    degreeInsectInfectivity: z.enum(["High", "Moderate", "Low", "Negligible"]).optional(),
    degreeRodentInfectivity: z.enum(["High", "Moderate", "Low", "Negligible"]).optional(),
    observations: z.string(),
    recommendations: z.string(),
});

export type DownloadProjectSchema = z.infer<typeof downloadProjectSchema>;

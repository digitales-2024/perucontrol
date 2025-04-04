import * as z from "zod";

export const clientDataSchema = z.object({
    clientId: z.string().uuid("Debe ser un UUID válido"),
    quotationId: z.union([z.string().uuid(), z.null()]).optional(),
    services: z.array(z.string().min(1, "El servicio es requerido")),
    price: z.number({message: "El precio es requerido"}),
    address: z.string().min(1, "La dirección es requerida")
        .max(100, "Máximo 100 caracteres"),
    area: z.preprocess(
        (val) => Number(val),
        z.number().int()
            .min(1, "Debe ser mayor a 0")
            .max(4294967295, "Valor demasiado grande"),
    ),
    spacesCount: z.preprocess(
        (val) => Number(val),
        z.number().int()
            .min(1, "Debe ser mayor a 0")
            .max(4294967295, "Valor demasiado grande"),
    ),
    appointments: z.array(z.string().min(1, "Debe programar al menos una fecha")),
    frequency: z.enum(["Bimonthly", "Quarterly", "Semiannual"]).optional(),
});

export type ClientDataSchema = z.infer<typeof clientDataSchema>;

export const downloadProjectSchema = z.object({
    projectAppointmentId: z.string(),
    operationDate: z.string(),
    enterTime: z.string(),
    leaveTime: z.string(),
    razonSocial: z.string(),
    address: z.string(),
    businessType: z.string(),
    treatedAreas: z.string(),
    service: z.array(z.string()),
    certificateNumber: z.string(),
    insects: z.string(),
    rodents: z.string(),
    rodentConsumption: z.enum(["Partial", "Total", "Deteriorated", "NoConsumption"]).optional(),
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
    colocacionCebosCebaderos: z.string().optional(),
    numeroCeboTotal: z.preprocess(
        (val) => (typeof val === "number" ? val.toString() : val),
        z.string(),
    ),
    numeroCeboRepuestos: z.preprocess(
        (val) => (typeof val === "number" ? val.toString() : val),
        z.string(),
    ),
    nroPlanchasPegantes: z.string(),
    nroJaulasTomahawk: z.string(),
    degreeInsectInfectivity: z.enum(["High", "Moderate", "Low", "Negligible"]).optional(),
    degreeRodentInfectivity: z.enum(["High", "Moderate", "Low", "Negligible"]).optional(),
    observations: z.string(),
    recommendations: z.string(),
});

export type DownloadProjectSchema = z.infer<typeof downloadProjectSchema>;

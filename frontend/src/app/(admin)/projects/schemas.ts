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
    // appointments: z.array(z.string().min(1, "Debe programar al menos una fecha")),
    appointments: z.array(z.object({
        dueDate: z.string().min(1, "La fecha es requerida"), // Fecha en formato ISO
        services: z.array(z.string().min(1, "Debe seleccionar al menos un servicio")), // IDs de los servicios
    })),
    frequency: z.enum(["Fortnightly","Monthly","Bimonthly", "Quarterly", "Semiannual"]).optional(),
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
    colocacionCebosCebaderos: z.string(),
    numeroCeboTotal: z.preprocess(
        (val) => (typeof val === "number" ? val.toString() : val),
        z.string(),
    ),
    numeroCeboRepuestos: z.preprocess(
        (val) => (typeof val === "number" ? val.toString() : val),
        z.string(),
    ),
    nroPlanchasPegantes: z.preprocess(
        (val) => (typeof val === "number" ? val.toString() : val),
        z.string(),
    ),
    nroJaulasTomahawk: z.preprocess(
        (val) => (typeof val === "number" ? val.toString() : val),
        z.string(),
    ),
    degreeInsectInfectivity: z.enum(["High", "Moderate", "Low", "Negligible"]).optional(),
    degreeRodentInfectivity: z.enum(["High", "Moderate", "Low", "Negligible"]).optional(),
    observations: z.string(),
    recommendations: z.string(),
});

export type DownloadProjectSchema = z.infer<typeof downloadProjectSchema>;

// Esquema para el certificado
export const certificateSchema = z.object({
    certificateNumber: z.string().optional(),
    clientName: z.string().optional(),
    location: z.string().optional(),
    businessType: z.string().optional(),
    treatedArea: z.string().optional(),
    serviceDate: z.string().optional(),
    expirationDate: z.string().min(1, "La fecha de vencimiento es requerida"),
    technicalDirector: z.string().optional(),
    responsible: z.string().optional(),
    services: z.object({
        fumigation: z.boolean().default(false),
        disinsection: z.boolean().default(false),
        deratization: z.boolean().default(false),
        disinfection: z.boolean().default(false),
        tankCleaning: z.boolean().default(false),
        drinkingWaterTankCleaning: z.boolean().default(false),
    }),
});

export type CertificateSchema = z.infer<typeof certificateSchema>

export const rodentControlRowSchema = z.object({
    rodentAreas: z.string().min(1, "El área controlada es requerida"),
    cebaderoTrampa: z.string(),
    frequency: z.string().optional(),
    rodentConsumption: z.string().optional(),
    rodentResult: z.string().optional(),
    rodentMaterials: z.string().optional(),
    productName: z.string(),
    productDose: z.string(),
    incidencias: z.string(),
});

// Esquema completo del formulario
export const rodentControlFormSchema = z.object({
    rows: z.array(rodentControlRowSchema).min(1, "Debe agregar al menos una fila"),
    medidasCorrectivas: z.string(),
});

export type RodentControlFormValues = z.infer<typeof rodentControlFormSchema>

import * as z from "zod";

export const clientDataSchema = z.object({
    clientId: z.string().uuid("Debe ser un cliente válido"),
    quotationId: z.union([z.string().uuid(), z.null()]).optional(),
    services: z.array(z.string().min(1, "El servicio es requerido"))
        .nonempty("Los servicios son obligatorios y no pueden estar vacío"),
    price: z.number({ message: "El precio es requerido" })
        .int("La cantidad debe ser un número entero")
        .min(1, "Debe ser mayor a 0"),
    ambients: z.array(z.string()),

    address: z.string().min(1, "La dirección es requerida")
        .max(100, "Máximo 100 caracteres"),
    area: z.preprocess(
        (val) => Number(val),
        z
            .number()
            .int("La cantidad debe ser un número entero")
            .min(1, "Debe ser mayor a 0")
            .max(4294967295, "Valor demasiado grande"),
    ),
    spacesCount: z.preprocess(
        (val) => Number(val),
        z
            .number()
            .int("La cantidad debe ser un número entero")
            .min(1, "Debe ser mayor a 0")
            .max(4294967295, "Valor demasiado grande"),
    ),
    appointments: z.array(z.object({
        dueDate: z.string().min(1, "La fecha es requerida"), // Fecha en formato ISO
        services: z.array(z.string().min(1, "Debe seleccionar al menos un servicio")), // IDs de los servicios
    })),
    frequency: z.enum(["Fortnightly", "Monthly", "Bimonthly", "Quarterly", "Semiannual"]).optional(),
});

export type ClientDataSchema = z.infer<typeof clientDataSchema>;

export const projectDataSchema = z.object({
    clientId: z.string().uuid("Debe ser un cliente válido"),
    quotationId: z.union([z.string().uuid(), z.null()]).optional(),
    services: z.array(z.string().min(1, "El servicio es requerido")),
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
    ambients: z.array(z.string().min(1, "El ambiente es requerido")),
    // Nuevo campo para el formulario
    environments: z.array(z.object({
        name: z.string().min(1, "El nombre del ambiente es requerido"),
    })).optional(),
});

export type ProjectDataSchema = z.infer<typeof projectDataSchema>;

// Add a type helper for the form fields
export type ProjectFormFields = {
    clientId: string;
    quotationId?: string | null;
    services: Array<string>;
    address: string;
    area: number;
    spacesCount: number;
    ambients: Array<string>;
};

export const downloadProjectSchema = z.object({
    projectAppointmentId: z.string(),
    enterTime: z.string().optional(),
    leaveTime: z.string().optional(),
    operationDate: z.string(),
    razonSocial: z.string(),
    address: z.string(),
    businessType: z.string(),
    treatedAreas: z.string(),
    service: z.array(z.string()),
    certificateNumber: z.string(),
    insects: z.string(),
    rodents: z.string(),
    rodentConsumptionPartial: z.string(),
    rodentConsumptionTotal: z.string(),
    rodentConsumptionDeteriorated: z.string(),
    rodentConsumptionNone: z.string(),
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
    aspercionMotor: z.boolean().optional()
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

export const RodentAreaSchema = z.object({
    id: z.string().uuid()
        .nullable()
        .optional(),
    name: z.string().optional(),
    cebaderoTrampa: z.coerce.number().int()
        .optional(),
    frequency: z.enum(["Fortnightly", "Monthly", "Bimonthly", "Quarterly", "Semiannual"]),
    rodentConsumption: z.enum(["Partial", "Total", "Deteriorated", "NoConsumption"]),
    rodentResult: z.enum(["Active", "Inactive", "RoedMto", "Others"]),
    rodentMaterials: z.enum(["Fungicide", "RodenticideOrBait", "StickyTrap", "Tomahawk"]),
    productName: z.string().optional(),
    productDose: z.string().optional(),
});

export const RodentControlFormSchema = z.object({
    serviceDate: z.string().nullable()
        .optional(),
    incidents: z.string().nullable()
        .optional(),
    correctiveMeasures: z.string().nullable()
        .optional(),
    rodentAreas: z.array(RodentAreaSchema).min(1, "Debe agregar al menos un área"),
});

// Exporta el type de React Hook Form
export type RodentControlFormValues = z.infer<typeof RodentControlFormSchema>;

export const TreatmentProductSchema = z.object({
    products: z
        .array(z.object({
            id: z.string().uuid()
                .nullable(),
            productName: z.string().min(1, "El nombre del producto es requerido"),
            amountAndSolvent: z.string().min(1, "La cantidad y solvente es requerida"),
            activeIngredient: z.string().min(1, "El ingrediente activo es requerido"),
            equipmentUsed: z.string().nullable(),
            appliedTechnique: z.string().nullable(),
            appliedService: z.string().nullable(),
        }))
        .min(1, "Debe haber al menos un producto"),
});

export type TreatmentProductFormValues = z.infer<typeof TreatmentProductSchema>;

export const treatmentAreaSchema = z.object({
    areas: z
        .array(z.object({
            id: z.string().uuid()
                .nullable(),
            observerVector: z.string().nullable(),
            infestationLevel: z.string().nullable(),
            performedService: z.string().nullable(),
            appliedTechnique: z.string().nullable(),
            treatmentProductIds: z.array(z.object({
                id: z.string().nullable()
                    .optional(),
            })),
        }))
        .min(1, "Debe haber al menos un área"),
});

export type TreatmentAreaFormValues = z.infer<typeof treatmentAreaSchema>;

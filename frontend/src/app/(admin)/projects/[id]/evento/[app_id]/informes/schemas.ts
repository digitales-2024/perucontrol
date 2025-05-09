import { z } from "zod";

// Definimos los tipos base primero
export type TextBlock = {
    $type: "textBlock";
    title: string;
    numbering: string;
    level: number;
    sections: Array<ContentSection>;
};

export type TextArea = {
    $type: "textArea";
    content: string;
};

export type ContentSection = TextBlock | TextArea;

// Ahora definimos los schemas
const TextAreaSchema = z.object({
    $type: z.literal("textArea"),
    content: z.string(),
});

// Definimos el schema base para TextBlock
const BaseTextBlockSchema = z.object({
    $type: z.literal("textBlock"),
    title: z.string(),
    numbering: z.string(),
    level: z.number(),
});

// Creamos una función para generar el schema recursivo
const createTextBlockSchema = (depth: number = 0): z.ZodType<TextBlock> =>
{
    if (depth >= 3)
    { // Limitamos la profundidad a 3 niveles
        return BaseTextBlockSchema.extend({
            sections: z.array(TextAreaSchema),
        }) as z.ZodType<TextBlock>;
    }

    return BaseTextBlockSchema.extend({
        sections: z.array(z.union([
            createTextBlockSchema(depth + 1),
            TextAreaSchema,
        ])),
    }) as z.ZodType<TextBlock>;
};

// Schema para el DTO completo
export const CompleteReportSchema = z.object({
    id: z.string().uuid(),
    signingDate: z.string().datetime()
        .nullable()
        .optional(),
    content: z.array(z.union([
        createTextBlockSchema(),
        TextAreaSchema,
    ])).transform((val) => val as Array<TextBlock | TextArea>),
});

// Tipo para el DTO completo
export type CompleteReportDTO = z.infer<typeof CompleteReportSchema>;

// Schema para el formulario de reporte
export const reportFormSchema = CompleteReportSchema;

// Tipo para los datos del formulario
export type ReportFormData = z.infer<typeof reportFormSchema>;

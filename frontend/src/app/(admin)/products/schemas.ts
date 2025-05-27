import * as z from "zod";

export const productSchema = z.object({
    name: z.string().min(1, "El nombre del producto es requerido"),
    activeIngredient: z.string().min(1, "El ingrediente activo es requerido"),
    solvents: z.array(z.string().min(1, "La cantidad y concentración es requerida")),
});

export type CreateProductSchema = z.infer<typeof productSchema>

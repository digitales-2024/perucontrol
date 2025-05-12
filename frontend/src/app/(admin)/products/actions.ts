"use server";

import { backend, FetchError, wrapper } from "@/types/backend";
import { ok, err, Result } from "@/utils/result";
import { components } from "@/types/api";

export async function RegisterProduct(product: components["schemas"]["ProductCreateInputDTO"]): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.POST("/api/Product", {
        ...auth,
        body: product,
    }));

    if (error)
    {
        console.log("Error registering product:", error);
        return err(error);
    }
    return ok(null);
}

/* export async function UpdateProduct(id: string, newProduct: components["schemas"]["Product"]): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.PATCH("/api/Product/{id}", {
        ...auth,
        body: newProduct,
        params: {
            id,
        },
    }));

    if (error)
    {
        console.log("Error updating product:", error);
        return err(error);
    }
    return ok(null);
} */

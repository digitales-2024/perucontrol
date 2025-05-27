"use server";

import { backend, FetchError, wrapper } from "@/types/backend";
import { ok, err, Result } from "@/utils/result";
import { components } from "@/types/api";
import { revalidatePath } from "next/cache";

export async function RegisterProduct(product: components["schemas"]["ProductCreateInputDTO"]): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.POST("/api/Product", {
        ...auth,
        body: product,
    }));

    revalidatePath("/(admin)/products", "page");

    if (error)
    {
        console.log("Error registering product:", error);
        return err(error);
    }
    return ok(null);
}

export async function UpdateProduct(id: string, newProduct: components["schemas"]["ProductUpdateInputDTO"]): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.PATCH("/api/Product/{id}", {
        ...auth,
        body: newProduct,
        params: {
            path: {
                id,
            },
        },
    }));

    revalidatePath("/(admin)/products", "page");

    if (error)
    {
        console.log("Error updating product:", error);
        return err(error);
    }
    return ok(null);
}

export async function RemoveProduct(id: string): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.DELETE("/api/Product/{id}", {
        ...auth,
        params: {
            path: {
                id: id,
            },
        },
    }));

    revalidatePath("/(admin)/products", "page");

    if (error)
    {
        console.log("Error deleting product:", error);
        return err(error);
    }
    return ok(null);
}

export async function ReactivatedProduct(id: string): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.PATCH("/api/Product/{id}/reactivate", {
        ...auth,
        params: {
            path: {
                id: id,
            },
        },
    }));

    revalidatePath("/(admin)/products", "page");

    if (error)
    {
        console.log("Error reactivating product:", error);
        return err({
            statusCode: error.statusCode,
            message: error.message,
            error: error.error,
        });
    }
    return ok(null);
}

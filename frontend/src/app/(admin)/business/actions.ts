"use server";

import { backend, FetchError, wrapper } from "@/types/backend";
import { ok, err, Result } from "@/utils/result";
import { revalidatePath } from "next/cache";
import { Business } from "./business";

export async function UpdateBusiness(id: string, data: Business): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.PATCH("/api/Business/{id}", {
        ...auth,
        body: data,
        params: {
            path: {
                id,
            },
        },
    }));

    revalidatePath("/(admin)/business", "page");

    if (error)
    {
        console.log("Error updating business info:", error);
        return err(error);
    }
    return ok(null);
}

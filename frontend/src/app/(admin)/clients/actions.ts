"use server";

import { backend, FetchError, wrapper } from "@/types/backend";
import { ok, err, Result } from "@/utils/result";
import { CreateClientSchema } from "./schemas";

export async function registerClient(input: CreateClientSchema): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.POST("/api/Client", {
        ...auth,
        body: input,
    }));

    if (error)
    {
        console.log("Error registering client:", error);
        return err(error);
    }
    return ok(null);
}

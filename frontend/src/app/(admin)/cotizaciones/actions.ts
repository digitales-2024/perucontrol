"use server";

import { components } from "@/types/api";
import { backend, FetchError, wrapper } from "@/types/backend";
import { err, ok, Result } from "@/utils/result";

export async function CreateTermsAndConditions(body: components["schemas"]["TermsAndConditions"])
    : Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.POST("/api/TermsAndConditions", {
        ...auth,
        body,
    }));
    if (error)
    {
        return err(error);
    }
    return ok(null);
}

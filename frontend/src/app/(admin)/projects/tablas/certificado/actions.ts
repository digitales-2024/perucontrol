"use server";

import { backend, FetchError, wrapper } from "@/types/backend";
import { err, ok, Result } from "@/utils/result";
import { revalidatePath } from "next/cache";

export async function MarkCertificateAsStarted(certificateId: string):
    Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.PATCH("/api/Certificate/{certificateId}/mark-started", {
        ...auth,
        params: {
            path: {
                certificateId,
            },
        },
    }));

    if (error)
    {
        return err(error);
    }

    revalidatePath("/(admin)/projects/tablas/fichas", "page");
    return ok(null);
}


"use server";

import { components } from "@/types/api";
import { backend, FetchError, wrapper } from "@/types/backend";
import { err, ok, Result } from "@/utils/result";
import { revalidatePath } from "next/cache";

export async function CreateProject(body: components["schemas"]["ProjectCreateDTO"]): Promise<Result<null, FetchError>>
{
    console.log("Projecto", JSON.stringify(body, null, 2));
    const [, error] = await wrapper((auth) => backend.POST("/api/Project", {
        ...auth,
        body,
    }));

    revalidatePath("/(admin)/projects", "page");

    if (error)
    {
        return err(error);
    }
    return ok(null);
}

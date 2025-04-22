"use server";

import { backend, FetchError, wrapper } from "@/types/backend";
import { ok, err, Result } from "@/utils/result";
import { revalidatePath } from "next/cache";
import { Business } from "./business";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_KEY } from "@/variables";

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

export async function UpdateSignatures(formData: FormData): Promise<Result<null, FetchError>>
{
    const c = await cookies();
    const jwt = c.get(ACCESS_TOKEN_KEY);

    try
    {
        // Loop through each file in the FormData
        const entries = Array.from(formData.entries()) as Array<[string, File]>;
        for (const [name, file] of entries)
        {
            if (!(file instanceof File)) continue;

            const singleForm = new FormData();
            singleForm.append("name", name);
            singleForm.append("file", file);

            const response = await fetch(`${process.env.INTERNAL_BACKEND_URL}/api/Business/upload-image`, {
                method: "POST",
                body: singleForm,
                headers: {
                    Authorization: `Bearer ${jwt?.value ?? "---"}`,
                },
            });

            if (!response.ok)
            {
                console.log(await response.text());
                return err({
                    statusCode: response.status,
                    message: `Error cargando imagen: ${name}`,
                    error: null,
                });
            }
        }

        revalidatePath("/(admin)/business", "page");
        return ok(null);
    }
    catch (e)
    {
        console.log("Error updating signatures:", e);
        return err({
            statusCode: 500,
            message: "Error cargando imágenes",
            error: null,
        });
    }
}

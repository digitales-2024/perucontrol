"use server";

import { cookies } from "next/headers";
import { ACCESS_TOKEN_KEY } from "@/variables";
import { revalidatePath } from "next/cache";
import { ok, err, Result } from "@/utils/result";
import { FetchError } from "@/types/backend";

export async function UploadMurinoMap(appointmentId: string, formData: FormData): Promise<Result<null, FetchError>>
{
    const c = await cookies();
    const jwt = c.get(ACCESS_TOKEN_KEY);

    try
    {
        const file = formData.get("murinoMap");
        if (!(file instanceof File))
        {
            return err({
                statusCode: 400,
                message: "No se envió ningún archivo",
                error: null,
            });
        }

        const singleForm = new FormData();
        singleForm.append("file", file);

        const response = await fetch(`${process.env.INTERNAL_BACKEND_URL}/api/Appointment/${appointmentId}/upload-murino-map`, {
            method: "POST",
            body: singleForm,
            headers: {
                Authorization: `Bearer ${jwt?.value ?? "---"}`,
            },
        });

        if (!response.ok)
        {
            return err({
                statusCode: response.status,
                message: "Error cargando el mapa murino",
                error: await response.text(),
            });
        }

        revalidatePath(`/admin/projects/${appointmentId}`, "page");
        return ok(null);
    }
    catch (e)
    {
        return err({
            statusCode: 500,
            message: "Error inesperado al subir el mapa murino",
            error: e,
        });
    }
}

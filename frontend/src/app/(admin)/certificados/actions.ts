"use server";

import { backend, FetchError, wrapper } from "@/types/backend";
import { CreateSchema } from "./_components/CertificateCreate";
import { err, ok, Result } from "@/utils/result";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_KEY } from "@/variables";

export async function CreateCertificate(data: CreateSchema)
    : Promise<Result<string, FetchError>>
{
    const [created, createErr] = await wrapper((auth) => backend.POST("/api/Certificate", {
        ...auth,
        body: data,
    }));
    if (createErr !== null)
    {
        //
        return err(createErr);
    }

    return ok(created.id!);
}

export async function DownloadCertificate(id: string)
    : Promise<Result<Blob, FetchError>>
{
    const c = await cookies();
    const jwt = c.get(ACCESS_TOKEN_KEY);
    if (!jwt)
    {
        return err({
            statusCode: 401,
            message: "No autorizado",
            error: null,
        });
    }

    try
    {
        const response = await fetch(`${process.env.INTERNAL_BACKEND_URL}/api/Certificate/${id}/gen-certificate-word`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${jwt.value}`,
            },
        });

        if (!response.ok)
        {
            // attempt to get data
            const body = await response.text();
            console.error("Error generando certificado:");
            console.error(body);

            return err({
                statusCode: response.status,
                message: "Error generando certificado",
                error: null,
            });
        }

        const blob = await response.blob();
        return ok(blob);
    }
    catch (e)
    {
        console.error(e);
        return err({
            statusCode: 503,
            message: "Error conectando al servidor",
            error: null,
        });
    }
}


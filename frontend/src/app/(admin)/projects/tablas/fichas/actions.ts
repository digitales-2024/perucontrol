"use server";

import { backend, DownloadFile, FetchError, wrapper } from "@/types/backend";
import { err, ok, Result } from "@/utils/result";
import { revalidatePath } from "next/cache";

export async function GenerateOperationSheetPdf(appointmentId: string): Promise<Result<Blob, FetchError>>
{
    return DownloadFile(`/api/OperationSheet/${appointmentId}/pdf`, "GET");
}

export async function MarkOperationSheetAsStarted(operationSheetId: string):
    Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.PATCH("/api/OperationSheet/{operationSheetId}/mark-started", {
        ...auth,
        params: {
            path: {
                operationSheetId,
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


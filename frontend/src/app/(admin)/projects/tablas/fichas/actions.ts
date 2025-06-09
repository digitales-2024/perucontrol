"use server";

import { DownloadFile, FetchError } from "@/types/backend";
import { Result } from "@/utils/result";

export async function GenerateOperationSheetPdf(appointmentId: string): Promise<Result<Blob, FetchError>>
{
    const url = `/api/Appointment/${appointmentId}/gen-operations-sheet/pdf`;
    return DownloadFile(url, "POST");
}

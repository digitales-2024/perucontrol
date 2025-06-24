"use server";

import { components } from "@/types/api";
import { FetchError, wrapper, backend, DownloadFile } from "@/types/backend";
import { Result, ok, err } from "@/utils/result";

export async function SaveCertificateData(
    certificateId: string,
    body: components["schemas"]["AppointmentCertificatePatchDTO"],
): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.PATCH("/api/Certificate/{certificateId}", {
        ...auth,
        params: {
            path: {
                certificateId,
            },
        },
        body,
    }));

    if (error)
    {
        return err(error);
    }
    return ok(null);
}

export async function GenerateCertificatePDF(certificateId: string): Promise<Result<Blob, FetchError>>
{
    return DownloadFile(`/api/Certificate/${certificateId}/pdf`, "POST", "");
}

export async function GetCertificateOfAppointmentById(appointmentId: string): Promise<Result<components["schemas"]["Certificate"], FetchError>>
{
    const [data, error] = await wrapper((auth) => backend.GET("/api/Appointment/{appointmentId}/Certificate", {
        ...auth,
        params: {
            path: {
                appointmentId,
            },
        },
    }));

    if (error)
    {
        console.log("Error fetching certificate client:", error);
        return err(error);
    }
    return ok(data);
}

export async function SendCertificatePDFViaEmail(certificateId: string, email: string): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.POST("/api/Certificate/{certificateId}/email-pdf", {
        ...auth,
        params: {
            path: {
                certificateId,
            },
            query: {
                email,
            },
        },
    }));

    if (error)
    {
        console.error("Error sending certificate PDF via email:", error);
        return err(error);
    }
    return ok(null);
}

export async function SendCertificatePDFViaWhatsapp(certificateId: string, phoneNumber: string): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.POST("/api/Certificate/{certificateId}/whatsapp-pdf", {
        ...auth,
        params: {
            path: {
                certificateId,
            },
            query: {
                phoneNumber,
            },
        },
    }));

    if (error)
    {
        console.error("Error sending certificate PDF via WhatsApp:", error);
        return err(error);
    }
    return ok(null);
}

export async function GenerateCertificateWord(id: string): Promise<Result<Blob, FetchError>>
{
    return DownloadFile(`/api/Appointment/${id}/certificate/word`, "POST", "");
}


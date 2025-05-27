"use server";

import { backend, DownloadFile, wrapper , FetchError} from "@/types/backend";

import { components } from "@/types/api";
import { err, ok, Result } from "@/utils/result";

export async function GenerateCompleteReportWord(appointmentid: string): Promise<Result<Blob, FetchError>>
{
    return DownloadFile(`/api/Appointment/${appointmentid}/CompleteReport/docx`, "GET");
}

export async function UpdateReport(
    appointmentId: string,
    body: components["schemas"]["CompleteReportDTO"],
): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.PATCH("/api/Appointment/{appointmentid}/CompleteReport", {
        ...auth,
        params: {
            path: {
                appointmentid: appointmentId,
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

// Report1 (Disinfection-Desinsect) Actions
export async function GenerateDisinfectionDesinsectWord(appointmentid: string): Promise<Result<Blob, FetchError>>
{
    return DownloadFile(`/api/Appointment/${appointmentid}/Disinfection-Desinsect/docx`, "GET");
}

export async function UpdateDisinfectionDesinsect(
    appointmentId: string,
    body: components["schemas"]["Report1DTO"],
): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.PATCH("/api/Appointment/{appointmentid}/Disinfection-Desinsect", {
        ...auth,
        params: {
            path: {
                appointmentid: appointmentId,
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

// Report2 (Sostenimiento Desinsectacion Desratization) Actions
export async function GenerateSostenimientoDesinsectacionDesratizationWord(appointmentid: string): Promise<Result<Blob, FetchError>>
{
    return DownloadFile(`/api/Appointment/${appointmentid}/RatExterminationSubst/docx`, "GET");
}

export async function UpdateSostenimientoDesinsectacionDesratization(
    appointmentId: string,
    body: components["schemas"]["Report2DTO"],
): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.PATCH("/api/Appointment/{appointmentid}/RatExterminationSubst", {
        ...auth,
        params: {
            path: {
                appointmentid: appointmentId,
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

// Report3 (Desratization) Actions
export async function GenerateDesratizationWord(appointmentid: string): Promise<Result<Blob, FetchError>>
{
    return DownloadFile(`/api/Appointment/${appointmentid}/Report3/docx`, "GET");
}

export async function UpdateDesratization(
    appointmentId: string,
    body: components["schemas"]["Report3DTO"],
): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.PATCH("/api/Appointment/{appointmentid}/Report3", {
        ...auth,
        params: {
            path: {
                appointmentid: appointmentId,
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

// Report4 (Sostenimiento Desratization) Actions
export async function GenerateSostenimientoDesratizationWord(appointmentid: string): Promise<Result<Blob, FetchError>>
{
    return DownloadFile(`/api/Appointment/${appointmentid}/RatExterminationSubst/docx`, "GET");
}

export async function UpdateSostenimientoDesratization(
    appointmentId: string,
    body: components["schemas"]["Report4DTO"],
): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.PATCH("/api/Appointment/{appointmentid}/RatExterminationSubst", {
        ...auth,
        params: {
            path: {
                appointmentid: appointmentId,
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

// Desratizacion Actions
export async function GenerateDesratizacionWord(appointmentid: string): Promise<Result<Blob, FetchError>>
{
    return DownloadFile(`/api/Appointment/${appointmentid}/RodenticideReport/docx`, "GET");
}

export async function UpdateDesratizacion(
    appointmentId: string,
    body: components["schemas"]["Report2DTO"],
): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.PATCH("/api/Appointment/{appointmentid}/RodenticideReport", {
        ...auth,
        params: {
            path: {
                appointmentid: appointmentId,
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

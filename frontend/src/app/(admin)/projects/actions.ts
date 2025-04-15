"use server";

import { components } from "@/types/api";
import { backend, DownloadFile, FetchError, wrapper } from "@/types/backend";
import { err, ok, Result } from "@/utils/result";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_KEY } from "@/variables";

export async function CreateProject(body: components["schemas"]["ProjectCreateDTO"]): Promise<Result<null, FetchError>>
{
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

export async function UpdateProject(id: string, newProject: components["schemas"]["ProjectPatchDTO"]): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.PATCH("/api/Project/{id}", {
        ...auth,
        body: newProject,
        params: {
            path: {
                id,
            },
        },
    }));

    revalidatePath("/(admin)/projects", "page");

    if (error)
    {
        console.log("Error updating project:", error);
        return err(error);
    }
    return ok(null);
}

export async function RemoveProject(id: string): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.DELETE("/api/Project/{id}/desactivate", {
        ...auth,
        params: {
            path: {
                id: id,
            },
        },
    }));

    revalidatePath("/(admin)/projects", "page");

    if (error)
    {
        console.log("Error deleting project:", error);
        return err(error);
    }
    return ok(null);
}

type StatesQuotation = "Pending" | "Approved" | "Rejected";

export async function UpdateStatus(id: string, newStatus: StatesQuotation): Promise<Result<null, FetchError>>
{
    console.log(id, newStatus);
    return err({
        statusCode: 503,
        message: "Desactivado - actualizar estado",
        error: null,
    });
}

export async function GenerateExcel(id: string): Promise<Result<Blob, FetchError>>
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
        const response = await fetch(`${process.env.INTERNAL_BACKEND_URL}/api/Appointment/${id}/gen-operations-sheet/excel`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwt.value}`,
            },
        });

        if (!response.ok)
        {
            // attempt to get data
            const body = await response.text();
            console.error("Error generando excel:");
            console.error(body);

            return err({
                statusCode: response.status,
                message: "Error generando excel",
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

export async function GeneratePDF(id: string): Promise<Result<Blob, FetchError>>
{
    return DownloadFile(`/api/Appointment/${id}/gen-operations-sheet/pdf`, "POST", "");
}

export async function SaveProjectOperationSheetData(
    id: string,
    body: components["schemas"]["ProjectOperationSheetCreateDTO"],
): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.PATCH("/api/Appointment/{appointmentid}/operation-sheet", {
        ...auth,
        params: {
            path: {
                appointmentid: body.projectAppointmentId!,
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

export async function GetProjectOperationSheet(projectId: string)
    : Promise<Result<components["schemas"]["ProjectOperationSheet"] | null, FetchError>>
{
    const [data, error] = await wrapper((auth) => backend.GET("/api/Appointment/operation-sheet/by-project/{projectId}", {
        ...auth,
        params: {
            path: {
                projectId: projectId,
            },
        },
    }));

    if (error)
    {
        return err(error);
    }
    return ok(data);
}

export async function AddAppointment(id: string, dueDate: string): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.POST("/api/Project/{id}/appointment", {
        ...auth,
        body: { dueDate },
        params: {
            path: {
                id,
            },
        },
    }));

    revalidatePath(`/(admin)/projects/[${id}]`, "page");

    if (error)
    {
        console.log("Error updateing dates", error);
        return err(error);
    }
    return ok(null);
}

export async function EditAppointment(
    projId: string,
    appId: string,
    dueDate: string | null, // Fecha planificada (opcional)
    orderNumber: number | null, // Número de orden (opcional)
    actualDate: string | null, // Fecha real (opcional)
): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.PATCH("/api/Project/{proj_id}/appointment/{app_id}", {
        ...auth,
        body: {
            orderNumber, // Número de orden
            dueDate, // Fecha planificada
            actualDate, // Fecha real
        },
        params: {
            path: {
                proj_id: projId,
                app_id: appId,
            },
        },
    }));

    if (error)
    {
        console.error("Error updating appointment project:", error);
        console.error(projId, appId);
        return err(error);
    }

    // Revalidar la página para obtener los datos actualizados
    revalidatePath(`/(admin)/projects/[${projId}]`, "page");

    return ok(null);
}

export async function DesactivateAppointment(
    projId: string,
    appId: string,
): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.DELETE("/api/Project/{proj_id}/appointment/{app_id}", {
        ...auth,
        params: {
            path: {

                proj_id: projId,

                app_id: appId,
            },
        },
    }));

    // Revalidar la página para obtener los datos actualizados
    revalidatePath(`/(admin)/projects/[${projId}]`, "page");

    if (error)
    {
        console.error("Error desactivando la cita:", error);
        return err(error);
    }

    return ok(null);
}

export async function SaveCertificateData(
    id: string,
    body: components["schemas"]["Certificate"],
): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.PATCH("/api/Appointment/{appointmentid}/certificate", {
        ...auth,
        params: {
            path: {
                appointmentid: body.projectAppointmentId!,
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

export async function GenerateCertificateExcel(id: string): Promise<Result<Blob, FetchError>>
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
        const response = await fetch(`${process.env.INTERNAL_BACKEND_URL}/api/Appointment/${id}/certificate/excel`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwt.value}`,
            },
        });

        if (!response.ok)
        {
            // attempt to get data
            const body = await response.text();
            console.error("Error generando excel:");
            console.error(body);

            return err({
                statusCode: response.status,
                message: "Error generando excel",
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

export async function GenerateCertificatePDF(id: string): Promise<Result<Blob, FetchError>>
{
    console.log("cert id:");
    console.log(id);
    return DownloadFile(`/api/Appointment/${id}/certificate/pdf`, "POST", "");
}

export async function GetCertificateOfAppointmentById(id: string): Promise<Result<components["schemas"]["Certificate"], FetchError>>
{
    const [data, error] = await wrapper((auth) => backend.GET("/api/Appointment/{appointmentid}/certificate", {
        ...auth,
        params: {
            path: {
                appointmentid: id,
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

export async function GenerateCertificateWord(id: string): Promise<Result<Blob, FetchError>>
{
    return DownloadFile(`/api/Appointment/${id}/certificate/word`, "POST", "");
}

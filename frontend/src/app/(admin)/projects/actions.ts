"use server";

import { components } from "@/types/api";
import { backend, FetchError, wrapper } from "@/types/backend";
import { err, ok, Result } from "@/utils/result";
import { revalidatePath } from "next/cache";
import { DownloadProjectSchema } from "./schemas";
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
    const [, error] = await wrapper((auth) => backend.DELETE("/api/Project/{id}", {
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

export async function GenerateExcel(id: string, body: DownloadProjectSchema): Promise<Result<Blob, FetchError>>
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
            body: JSON.stringify(body),
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

export async function SaveProjectOperationSheetData(
    id: string,
    body: components["schemas"]["ProjectOperationSheetCreateDTO"],
): Promise<Result<null, FetchError>>
{
    const c = await cookies();
    const jwt = c.get(ACCESS_TOKEN_KEY);

    if (!jwt)
    {
        console.error("No autorizado: No hay JWT.");
        return err({
            statusCode: 401,
            message: "No autorizado",
            error: null,
        });
    }

    try
    {
        const url = `${process.env.INTERNAL_BACKEND_URL}/api/Appointment/operation-sheet`;
        console.log("URL de la API:", url);

        const response = await fetch(url, {
            method: "POST", // Siempre POST
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwt.value}`,
            },
            body: JSON.stringify(body),
        });

        console.log("Respuesta de la API:", response);

        if (!response.ok)
        {
            let errorBody;
            try
            {
                errorBody = await response.json();
            }
            catch (e)
            {
                errorBody = "No se pudo obtener información adicional del error.";
                console.error("Error guardando datos del proyecto :", e);
            }
            console.error("Error guardando datos del proyecto:", errorBody);
            return err({
                statusCode: response.status,
                message: "Error guardando datos del proyecto",
                error: JSON.stringify(errorBody, null, 2),
            });
        }

        return ok(null);
    }
    catch (e)
    {
        console.error("Error en la solicitud:", e);
        return err({
            statusCode: 500,
            message: "Error en la solicitud",
            error: "Error en la solicitud",
        });
    }
}

export async function GetProjectOperationSheet(projectId: string): Promise<Result<components["schemas"]["ProjectOperationSheet"] | null, FetchError>>
{
    const c = await cookies();
    const jwt = c.get(ACCESS_TOKEN_KEY);

    if (!jwt)
    {
        console.error("No autorizado: No hay JWT.");
        return err({
            statusCode: 401,
            message: "No autorizado",
            error: null,
        });
    }

    try
    {
        const url = `${process.env.INTERNAL_BACKEND_URL}/api/Appointment/operation-sheet/by-project/${projectId}`;
        console.log("URL de la API:", url);

        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${jwt.value}`,
            },
        });

        if (response.status === 404)
        {
            console.warn("No se encontró una ficha operativa para el proyecto especificado.");
            return ok(null); // Retorna null en lugar de un error
        }

        if (!response.ok)
        {
            let errorBody;
            const contentType = response.headers.get("Content-Type");

            if (contentType && contentType.includes("application/json"))
            {
                errorBody = await response.json();
            }
            else
            {
                errorBody = await response.text(); // Manejar texto plano
            }

            console.error("Error obteniendo la ficha operativa:", errorBody);
            return err({
                statusCode: response.status,
                message: "Error obteniendo la ficha operativa",
                error: errorBody,
            });
        }

        const data = await response.json();
        return ok(data);
    }
    catch (e)
    {
        console.error("Error en la solicitud:", e);
        return err({
            statusCode: 500,
            message: "Error en la solicitud",
            error: "Error en la solicitud",
        });
    }
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
                // eslint-disable-next-line camelcase
                proj_id: projId,
                // eslint-disable-next-line camelcase
                app_id: appId,
            },
        },
    }));

    // Revalidar la página para obtener los datos actualizados
    revalidatePath(`/(admin)/projects/[${projId}]`, "page");

    if (error)
    {
        console.error("Error updating appointment project:", error);
        return err(error);
    }

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
                // eslint-disable-next-line camelcase
                proj_id: projId,
                // eslint-disable-next-line camelcase
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

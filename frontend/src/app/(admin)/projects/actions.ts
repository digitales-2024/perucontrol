"use server";

import { components } from "@/types/api";
import { backend, DownloadFile, DownloadFileWithHeaders, DownloadFileWithFilename, FetchError, wrapper, type FileDownloadResponse, type ServerFileDownloadResponse } from "@/types/backend";
import { err, ok, Result } from "@/utils/result";
import { revalidatePath } from "next/cache";

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

export async function ReactivatedProject(id: string): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.PATCH("/api/Project/{id}/reactivate", {
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
        console.log("Error reactivating project:", error);
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

export async function GenerateOperationSheetExcel(id: string): Promise<Result<Blob, FetchError>>
{
    return DownloadFile(`/api/OperationSheet/${id}/excel`, "GET", null);
}

export async function GenerateOperationSheetExcelWithHeaders(id: string): Promise<Result<FileDownloadResponse, FetchError>>
{
    return DownloadFileWithHeaders(`/api/OperationSheet/${id}/excel`, "GET", null);
}

export async function GenerateOperationSheetPDF(id: string): Promise<Result<Blob, FetchError>>
{
    return DownloadFile(`/api/OperationSheet/${id}/pdf`, "GET", null);
}

export async function SaveProjectOperationSheetData(
    appointmentid: string,
    body: components["schemas"]["OperationSheetPatchDTO"],
): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.PATCH("/api/OperationSheet/by-appointment/{appointmentid}", {
        ...auth,
        params: {
            path: {
                appointmentid,
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
    const [data, error] = await wrapper((auth) => backend.GET("/api/OperationSheet/by-project/{projectId}", {
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

export async function AddAppointment(id: string, dueDate: string, serviceIds?: Array<string>): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.POST("/api/Project/{id}/appointment", {
        ...auth,
        body: {
            dueDate,
            serviceIds: serviceIds ?? [],
        },
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

export async function CancelAppointment(
    projId: string,
    appId: string,
    cancelled: boolean, // <- true para cancelar, false para reactivar
): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.PATCH("/api/Project/{proj_id}/cancel/{app_id}", {
        ...auth,
        body: {
            cancelled,
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
        console.error("Error cancelling/reactivating appointment:", error);
        return err(error);
    }

    // Revalidar la página para obtener los datos actualizados
    revalidatePath(`/(admin)/projects/[${projId}]`, "page");

    return ok(null);
}

export async function UpdateAppointmentTimes(
    id: string,
    enterTime: string | null,
    leaveTime: string | null,
): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.PATCH("/api/Project/{id}/times", {
        ...auth,
        body: {
            enterTime,
            leaveTime,
        },
        params: {
            path: {
                id,
            },
        },
    }));

    if (error)
    {
        console.error("Error updating appointment times:", error);
        return err(error);
    }

    // Revalidar para obtener los datos nuevos
    revalidatePath(`/(admin)/projects/[${id}]`, "page");

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

export async function GenerateRodentsPDF(id: string): Promise<Result<Blob, FetchError>>
{
    return DownloadFile(`/api/Appointment/${id}/rodents/pdf`, "POST", "");
}

export async function GenerateRodentExcel(id: string): Promise<Result<Blob, FetchError>>
{
    return DownloadFile(`/api/Appointment/${id}/rodents/excel`, "POST", "");
}

export async function SaveRodentData(
    id: string,
    body: components["schemas"]["RodentRegisterUpdateDTO"],
): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.PATCH("/api/Appointment/{appointmentId}/rodent", {
        ...auth,
        params: {
            path: {
                appointmentId: id,
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

export async function GetRodentOfAppointmentById(id: string): Promise<Result<components["schemas"]["RodentRegisterUpdateDTO"], FetchError>>
{
    const [data, error] = await wrapper((auth) => backend.GET("/api/Appointment/{appointmentid}/rodent", {
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

export async function GenerateSchedulePDF(id: string): Promise<Result<Blob, FetchError>>
{
    return DownloadFile(`/api/Project/${id}/schedule/pdf`, "POST", "");
}

export async function GenerateSchedulePDFWithHeaders(id: string): Promise<Result<FileDownloadResponse, FetchError>>
{
    return DownloadFileWithHeaders(`/api/Project/${id}/schedule/pdf`, "POST", "");
}

export async function GenerateSchedulePDFWithFilename(id: string): Promise<Result<ServerFileDownloadResponse, FetchError>>
{
    return DownloadFileWithFilename(`/api/Project/${id}/schedule/pdf`, "POST", "");
}

export async function GenerateScheduleExcel(id: string): Promise<Result<Blob, FetchError>>
{
    return DownloadFile(`/api/Project/${id}/schedule/excel`, "POST", "");
}

export async function GenerateScheduleExcelWithHeaders(id: string): Promise<Result<FileDownloadResponse, FetchError>>
{
    return DownloadFileWithHeaders(`/api/Project/${id}/schedule/excel`, "POST", "");
}

export async function GenerateScheduleExcelWithFilename(id: string): Promise<Result<ServerFileDownloadResponse, FetchError>>
{
    return DownloadFileWithFilename(`/api/Project/${id}/schedule/excel`, "POST", "");
}

export async function GenerateSchedule2PDF(id: string): Promise<Result<Blob, FetchError>>
{
    return DownloadFile(`/api/Project/${id}/schedule2/pdf`, "POST", "");
}

export async function GenerateSchedule2Excel(id: string): Promise<Result<Blob, FetchError>>
{
    return DownloadFile(`/api/Project/${id}/schedule2/excel`, "POST", "");
}

export async function GenerateSchedule2ExcelWithHeaders(id: string): Promise<Result<FileDownloadResponse, FetchError>>
{
    return DownloadFileWithHeaders(`/api/Project/${id}/schedule2/excel`, "POST", "");
}

export async function GenerateSchedule2ExcelWithFilename(id: string): Promise<Result<ServerFileDownloadResponse, FetchError>>
{
    return DownloadFileWithFilename(`/api/Project/${id}/schedule2/excel`, "POST", "");
}

export async function Generate(
    id: string,
    endpoint: string,
    day: string,
    month: string,
    year: string,
): Promise<Result<Blob, FetchError>>
{
    const requestBody = {
        day,
        month,
        year,
    };

    return DownloadFile(
        `/api/Project/${id}/${endpoint}`,
        "POST",
        JSON.stringify(requestBody),
    );
}

export async function CreateTreatmentProduct(appointmentId: string, body: Array<components["schemas"]["TreatmentProductInDTO"]>): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.PATCH("/api/Appointment/{appointmentid}/TreatmentProduct", {
        ...auth,
        body: body,
        params: {
            path: {
                appointmentid: appointmentId,
            },
        },
    }));

    if (error)
    {
        return err(error);
    }
    return ok(null);
}

export async function CreateTreatmentArea(appointmentId: string, body: Array<components["schemas"]["TreatmentAreaInDTO"]>): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.PATCH("/api/Appointment/{appointmentid}/TreatmentArea", {
        ...auth,
        body,
        params: {
            path: {
                appointmentid: appointmentId,
            },
        },
    }));

    if (error)
    {
        return err(error);
    }
    return ok(null);
}

export async function SendSchedulePDFViaEmail(id: string, email: string): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.POST("/api/Project/{id}/schedule/email-pdf", {
        ...auth,
        params: {
            path: {
                id,
            },
            query: {
                email,
            },
        },
    }));

    if (error)
    {
        console.error("Error sending schedule PDF via email:", error);
        return err(error);
    }
    return ok(null);
}

export async function SendSchedulePDFViaWhatsapp(id: string, phoneNumber: string): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.POST("/api/Project/{id}/schedule/whatsapp-pdf", {
        ...auth,
        params: {
            path: {
                id,
            },
            query: {
                phoneNumber,
            },
        },
    }));

    if (error)
    {
        console.error("Error sending schedule PDF via WhatsApp:", error);
        return err(error);
    }
    return ok(null);
}

export async function SendRodentPDFViaEmail(appointmentId: string, email: string): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.POST("/api/Appointment/{id}/rodents/email-pdf", {
        ...auth,
        params: {
            path: {
                id: appointmentId,
            },
            query: {
                email,
            },
        },
    }));

    if (error)
    {
        console.error("Error sending rodent PDF via email:", error);
        return err(error);
    }
    return ok(null);
}

export async function SendRodentPDFViaWhatsapp(appointmentId: string, phoneNumber: string): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.POST("/api/Appointment/{id}/rodents/whatsapp-pdf", {
        ...auth,
        params: {
            path: {
                id: appointmentId,
            },
            query: {
                phoneNumber,
            },
        },
    }));

    if (error)
    {
        console.error("Error sending rodent PDF via WhatsApp:", error);
        return err(error);
    }
    return ok(null);
}

export async function SendOperationSheetPDFViaEmail(appointmentId: string, email: string): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.POST("/api/OperationSheet/{id}/email-pdf", {
        ...auth,
        params: {
            path: {
                id: appointmentId, // Ensure this matches the {id} in the path
            },
            query: {
                email,
            },
        },
    }));

    if (error)
    {
        console.error("Error sending operation sheet PDF via email:", error);
        return err(error);
    }
    return ok(null);
}

export async function SendOperationSheetPDFViaWhatsapp(appointmentId: string, phoneNumber: string): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.POST("/api/OperationSheet/{id}/whatsapp-pdf", {
        ...auth,
        params: {
            path: {
                id: appointmentId, // Ensure this matches the {id} in the path
            },
            query: {
                phoneNumber,
            },
        },
    }));

    if (error)
    {
        console.error("Error sending operation sheet PDF via WhatsApp:", error);
        return err(error);
    }
    return ok(null);
}

export async function DuplicateFromPreviousAppointment(appointmentId: string): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.POST("/api/Appointment/{id}/duplicate-from-previous", {
        ...auth,
        params: {
            path: {
                id: appointmentId,
            },
        },
    }));

    if (error)
    {
        console.error("Error duplicating from previous appointment:", error);
        return err(error);
    }

    // Revalidate to refresh the data after duplication
    revalidatePath("/(admin)/projects", "layout");

    return ok(null);
}

export async function ExportProjectsCSV(startDate?: string, endDate?: string): Promise<Result<Blob, FetchError>>
{
    let url = "/api/Project/export/csv";
    const params = new URLSearchParams();

    if (startDate)
    {
        params.append("startDate", startDate);
    }
    if (endDate)
    {
        params.append("endDate", endDate);
    }

    if (params.toString())
    {
        url += `?${params.toString()}`;
    }

    return DownloadFile(url, "GET");
}

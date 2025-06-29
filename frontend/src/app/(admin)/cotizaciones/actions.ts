"use server";

import type { components } from "@/types/api";
import { backend, FetchError, wrapper, DownloadFile } from "@/types/backend";
import { err, ok, Result } from "@/utils/result";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_KEY } from "@/variables";

export async function CreateTermsAndConditions(body: components["schemas"]["TermsAndConditions"])
    : Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.POST("/api/TermsAndConditions", {
        ...auth,
        body,
    }));
    if (error)
    {
        return err(error);
    }
    revalidatePath("/(admin)/cotizaciones", "page");
    return ok(null);
}

export async function DeleteTermsAndConditions(id: string)
    : Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.DELETE("/api/TermsAndConditions/{id}", {
        ...auth,
        params: {
            path: {
                id,
            },
        },
    }));
    if (error)
    {
        return err(error);
    }

    revalidatePath("/(admin)/cotizaciones", "page");
    return ok(null);
}

export async function GetTermsAndConditionsById(id: string): Promise<Result<components["schemas"]["TermsAndConditions"], FetchError>>
{
    const [data, error] = await wrapper((auth) => backend.GET("/api/TermsAndConditions/{id}", {
        ...auth,
        params: {
            path: {
                id: id,
            },
        },
    }));

    if (error)
    {
        console.log("Error fetching terms and conditions client:", error);
        return err(error);
    }
    return ok(data);
}

export async function RegisterQuotation(body: components["schemas"]["QuotationCreateDTO"]): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.POST("/api/Quotation", {
        ...auth,
        body,
    }));
    if (error)
    {
        return err(error);
    }
    revalidatePath("/(admin)/cotizaciones", "page");
    return ok(null);
}

export async function UpdateQuotation(id: string, newQuotation: components["schemas"]["QuotationPatchDTO"]): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.PATCH("/api/Quotation/{id}", {
        ...auth,
        body: newQuotation,
        params: {
            path: {
                id: id,
            },
        },
    }));

    revalidatePath("/(admin)/cotizaciones", "page");

    if (error)
    {
        console.log("Error updating quotation:", error);
        return err(error);
    }
    return ok(null);
}

export async function RemoveQuotation(id: string): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.DELETE("/api/Quotation/{id}", {
        ...auth,
        params: {
            path: {
                id: id,
            },
        },
    }));

    revalidatePath("/(admin)/cotizaciones", "page");

    if (error)
    {
        console.log("Error deleting quotation:", error);
        return err(error);
    }
    return ok(null);
}

export async function ReactivatedQuotation(id: string): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.PATCH("/api/Quotation/{id}/reactivate", {
        ...auth,
        params: {
            path: {
                id: id,
            },
        },
    }));

    revalidatePath("/(admin)/cotizaciones", "page");

    if (error)
    {
        console.log("Error reactivating quotation:", error);
        return err({
            statusCode: error.statusCode,
            message: error.message,
            error: error.error,
        });
    }
    return ok(null);
}

type StatesQuotation = "Pending" | "Approved" | "Rejected";

export async function UpdateStatus(id: string, newStatus: StatesQuotation): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.PATCH("/api/Quotation/{id}/update-state", {
        ...auth,
        body:
        {
            status: newStatus,
        },
        params: {
            path: {
                id: id,
            },
        },
    }));

    revalidatePath("/(admin)/cotizaciones", "page");

    if (error)
    {
        console.log("Error updating status:", error);
        return err(error);
    }
    return ok(null);
}

export async function GenerateExcel(id: string): Promise<Result<[Blob, string], FetchError>>
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
        const response = await fetch(`${process.env.INTERNAL_BACKEND_URL}/api/Quotation/${id}/gen-excel`, {
            method: "GET",
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

        // Extract filename from Content-Disposition header
        const contentDisposition = response.headers.get("Content-Disposition");
        let filename = `quotation-${id}.xlsx`; // fallback filename

        if (contentDisposition)
        {
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch)
            {
                filename = filenameMatch[1].replace(/['"]/g, "");
            }
        }

        return ok([blob, filename]);
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

export async function GeneratePdf(id: string): Promise<Result<[Blob, string], FetchError>>
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
        const response = await fetch(`${process.env.INTERNAL_BACKEND_URL}/api/Quotation/${id}/gen-pdf`, {
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
            console.error("Error generando pdf:");
            console.error(body);

            return err({
                statusCode: response.status,
                message: "Error generando pdf",
                error: null,
            });
        }

        const blob = await response.blob();

        // Extract filename from Content-Disposition header
        const contentDisposition = response.headers.get("Content-Disposition");
        let filename = `quotation-${id}.pdf`; // fallback filename

        if (contentDisposition)
        {
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch)
            {
                filename = filenameMatch[1].replace(/['"]/g, "");
            }
        }

        return ok([blob, filename]);
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

export async function SendQuotationPdfViaMail(id: string, email: string): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.POST("/api/Quotation/{id}/email-pdf", {
        ...auth,
        params: {
            path: {
                id: id,
            },
            query: {
                email,
            },
        },
    }));

    if (error)
    {
        console.log("Error reactivating quotation:", error);
        return err({
            statusCode: error.statusCode,
            message: error.message,
            error: error.error,
        });
    }
    return ok(null);
}

export async function SendQuotationPdfViaWhatsapp(id: string, phoneNumber: string): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.POST("/api/Quotation/{id}/whatsapp-pdf", {
        ...auth,
        params: {
            path: {
                id: id,
            },
            query: {
                phoneNumber,
            },
        },
    }));

    if (error)
    {
        console.log("Error reactivating quotation:", error);
        return err({
            statusCode: error.statusCode,
            message: error.message,
            error: error.error,
        });
    }
    return ok(null);
}

export async function ExportQuotationsCSV(startDate?: string, endDate?: string): Promise<Result<Blob, FetchError>>
{
    let url = "/api/Quotation/export/csv";
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

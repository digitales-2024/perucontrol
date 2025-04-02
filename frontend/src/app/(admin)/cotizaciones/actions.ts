"use server";

import type { components } from "@/types/api";
import { backend, FetchError, wrapper } from "@/types/backend";
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
        const response = await fetch(`${process.env.INTERNAL_BACKEND_URL}/api/Quotation/${id}/gen-excel`, {
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

export async function GeneratePdf(id: string): Promise<Result<Blob, FetchError>>
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

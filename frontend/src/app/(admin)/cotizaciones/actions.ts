"use server";

import { components } from "@/types/api";
import { backend, FetchError, wrapper } from "@/types/backend";
import { err, ok, Result } from "@/utils/result";
import { revalidatePath } from "next/cache";
import { CreateQuotationSchema } from "./schemas";

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
    await wrapper((auth) => backend.DELETE("/api/TermsAndConditions/{id}", {
        ...auth,
        params: {
            path: {
                id,
            },
        },
    }));
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

export async function UpdateQuotation(id: string, newQuotation: CreateQuotationSchema): Promise<Result<null, FetchError>>
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

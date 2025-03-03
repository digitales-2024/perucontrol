"use server";

import { components } from "@/types/api";
import { backend, FetchError, wrapper } from "@/types/backend";
import { err, ok, Result } from "@/utils/result";
import { revalidatePath } from "next/cache";

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

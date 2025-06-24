"use server";

import { backend, FetchError, wrapper, DownloadFile } from "@/types/backend";
import { ok, err, Result } from "@/utils/result";
import { components } from "@/types/api";
import { revalidatePath } from "next/cache";
import { CreateSupplierSchema } from "../_schemas/createSuppliersSchema";

export async function RegisterSupplier(supplier: components["schemas"]["SupplierCreateDTO"]): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.POST("/api/Supplier", {
        ...auth,
        body: supplier,
    }));

    revalidatePath("/(admin)/suppliers", "page");

    if (error)
    {
        console.log("Error registering supplier:", error);
        return err(error);
    }
    return ok(null);
}

export async function UpdateSupplier(
    id: string,
    newSupplier: CreateSupplierSchema,
): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.PATCH("/api/Supplier/update/{id}", {
        ...auth,
        body: newSupplier,
        params: {
            path: {
                id: id,
            },
        },
    }));

    revalidatePath("/(admin)/suppliers", "page");

    if (error)
    {
        console.log("Error updating supplier:", error);
        return err(error);
    }
    return ok(null);
}

export async function RemoveSupplier(id: string): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.DELETE("/api/Supplier/{id}", {
        ...auth,
        params: {
            path: {
                id: id,
            },
        },
    }));

    revalidatePath("/(admin)/suppliers", "page");

    if (error)
    {
        console.log("Error deleting supplier:", error);
        return err({
            statusCode: error.statusCode,
            message: error.message,
            error: error.error,
        });
    }
    return ok(null);
}

export async function ReactivateSupplier(id: string): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.PATCH("/api/Supplier/{id}/reactivate", {
        ...auth,
        params: {
            path: {
                id: id,
            },
        },
    }));

    revalidatePath("/(admin)/suppliers", "page");

    if (error)
    {
        console.log("Error reactivating supplier:", error);
        return err({
            statusCode: error.statusCode,
            message: error.message,
            error: error.error,
        });
    }
    return ok(null);
}

export async function ExportSuppliersCSV(
    startDate?: string,
    endDate?: string,
): Promise<Result<Blob, FetchError>>
{
    let url = "/api/Supplier/export/csv";
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

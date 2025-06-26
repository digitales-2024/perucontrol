"use server";

import { backend, DownloadFileWithFilename, FetchError, ServerFileDownloadResponse, wrapper } from "@/types/backend";
import { ok, err, Result } from "@/utils/result";
import { components } from "@/types/api";
import { revalidatePath } from "next/cache";

// CREATE Purchase Order
export async function RegisterPurchaseOrder(order: components["schemas"]["PurchaseOrderCreateDTO"]): Promise<Result<components["schemas"]["PurchaseOrder"], FetchError>>
{
    const [data, error] = await wrapper((auth) => backend.POST("/api/PurchaseOrder", {
        ...auth,
        body: order,
    }));

    revalidatePath("/(admin)/purchase-orders", "page");

    if (error)
    {
        console.log("Error registering purchase order:", error);
        return err(error);
    }
    return ok(data!);
}

// UPDATE Purchase Order
export async function UpdatePurchaseOrder(
    id: string,
    patch: components["schemas"]["PurchaseOrderPatchDTO"],
): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.PATCH("/api/PurchaseOrder/{id}", {
        ...auth,
        body: patch,
        params: { path: { id } },
    }));

    revalidatePath("/(admin)/purchase-orders", "page");

    if (error)
    {
        console.log("Error updating purchase order:", error);
        return err(error);
    }
    return ok(null);
}

// GET Purchase Order by ID
export async function GetPurchaseOrderById(id: string): Promise<Result<components["schemas"]["PurchaseOrder"], FetchError>>
{
    const [data, error] = await wrapper((auth) => backend.GET("/api/PurchaseOrder/{id}", {
        ...auth,
        params: { path: { id } },
    }));

    if (error)
    {
        console.log("Error fetching purchase order by id:", error);
        return err(error);
    }
    return ok(data!);
}

// LIST & FILTER Purchase Orders
export async function GetPurchaseOrders(params?: {
    startDate?: string;
    endDate?: string;
    supplierId?: string;
    currency?: number;
    status?: number;
}): Promise<Result<Array<components["schemas"]["PurchaseOrder"]>, FetchError>>
{
    const [data, error] = await wrapper((auth) => backend.GET("/api/PurchaseOrder", {
        ...auth,
        params: {
            query: {
                ...(params?.startDate && { startDate: params.startDate }),
                ...(params?.endDate && { endDate: params.endDate }),
                ...(params?.supplierId && {
                    supplierId: params.supplierId,
                }),
                ...(params?.currency !== undefined && {
                    currency: String(params.currency),
                }),
                ...(params?.status !== undefined && {
                    status: String(params.status),
                }),
            },
        },
    }));

    if (error)
    {
        console.log("Error fetching purchase orders:", error);
        return err(error);
    }
    return ok(data ?? []);
}

// CHANGE STATUS Purchase Order
export async function ChangePurchaseOrderStatus(
    id: string,
    status: number, // 0 = Pending, 1 = Accepted, 2 = Cancelled
): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.PATCH("/api/PurchaseOrder/{id}/status", {
        ...auth,
        params: {
            path: { id },
            query: { status },
        },
    }));

    revalidatePath("/(admin)/purchase-orders", "page");

    if (error)
    {
        console.log("Error changing purchase order status:", error);
        return err(error);
    }
    return ok(null);
}

export async function GeneratePurchaseOrderPdf(id: string): Promise<Result<ServerFileDownloadResponse, FetchError>>
{
    return DownloadFileWithFilename(`/api/PurchaseOrder/${id}/pdf`, "GET");
}

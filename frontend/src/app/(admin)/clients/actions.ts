"use server";

import { backend, FetchError, wrapper } from "@/types/backend";
import { ok, err, Result } from "@/utils/result";
import { CreateClientSchema } from "./schemas";
import { components } from "@/types/api";
import { revalidatePath } from "next/cache";

export async function RegisterClient(client: components["schemas"]["ClientCreateDTO"]): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.POST("/api/Client", {
        ...auth,
        body: client,
    }));

    revalidatePath("/(admin)/clients", "page");

    if (error)
    {
        console.log("Error registering client:", error);
        return err(error);
    }
    return ok(null);
}

type SunatResponse = components["schemas"]["SunatQueryResponse"]

export async function SearchClientByRuc(ruc: string): Promise<Result<SunatResponse, FetchError>>
{
    const [data, error] = await wrapper((auth) => backend.GET("/api/Client/search-by-ruc/{ruc}", {
        ...auth,
        params: {
            path: {
                ruc: ruc,
            },
        },
    }));

    if (error)
    {
        console.error("Error searching client by RUC:", error);
        return err(error);
    }
    return ok(data);
}

export async function UpdateClient(id: string, newClient: CreateClientSchema): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.PATCH("/api/Client/{id}", {
        ...auth,
        body: newClient,
        params: {
            path: {
                id: id,
            },
        },
    }));

    revalidatePath("/(admin)/clients", "page");

    if (error)
    {
        console.log("Error updating client:", error);
        return err(error);
    }
    return ok(null);
}

export async function RemoveClient(id: string): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.DELETE("/api/Client/{id}", {
        ...auth,
        params: {
            path: {
                id: id,
            },
        },
    }));

    revalidatePath("/(admin)/clients", "page");

    if (error)
    {
        console.log("Error deleting client:", error);
        return err({
            statusCode: error.statusCode,
            message: error.message,
            error: error.error,
        });
    }
    return ok(null);
}

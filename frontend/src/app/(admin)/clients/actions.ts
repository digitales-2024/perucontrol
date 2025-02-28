"use server";

import { backend, FetchError, wrapper } from "@/types/backend";
import { ok, err, Result } from "@/utils/result";
import { CreateClientSchema } from "./schemas";
import { components } from "@/types/api";
import { revalidatePath } from "next/cache";

export async function registerClient(input: CreateClientSchema): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.POST("/api/Client", {
        ...auth,
        body: input,
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

export async function searchClientByRuc(ruc: string): Promise<Result<SunatResponse, FetchError>>
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

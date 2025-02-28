import createClient from "openapi-fetch";
import type { paths } from "./api";
import { err, ok, Result } from "@/utils/result";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_KEY } from "@/variables";

/**
 * Client for connecting with the backend
 */
export const backend = createClient<paths>({ baseUrl: process.env.INTERNAL_BACKEND_URL ?? "http://localhost:5233" });

type AuthHeader = {
    headers: {
        Authorization: string
    }
}

type FetchResult<A, B> = {
    data?: A,
    error?: B,
    response: Response,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FetchError<T = any> = {
    statusCode: number;
    message: string;
    error: T;
};

/**
 * Wraps a backend call, ensuring it never throws, and can be safely
 * used in server components/server actions without disrupting control flow.
 *
 * The parameter `auth` to `fn` is an object that contains the Authorization: Bearer
 * header for requests with the backend.
 *
 * This wrapper assumes that the caller is running on the server and has access
 * to cookies.
 */
export async function wrapper<Data, Error>(fn: (auth: AuthHeader) => Promise<FetchResult<Data, Error>>)
    : Promise<Result<Data, FetchError<Error>>>
{
    // get auth
    const c = await cookies();
    const jwt = c.get(ACCESS_TOKEN_KEY);

    try
    {
        const data = await fn({ headers: { Authorization: `Bearer ${jwt?.value ?? "---"}` } });
        if (data.response.ok)
        {
            return ok(data.data!);
        }

        if (data.error)
        {
            const e = data.error as Error;
            if (typeof e === "object" && e !== null && "title" in e)
            {
                return err({
                    statusCode: data.response.status,
                    message: `${e.title}`,
                    error: data.error,
                });
            }

            if (typeof e === "string")
            {
                return err({
                    statusCode: data.response.status,
                    message: e,
                    error: data.error,
                });
            }

            return err({
                statusCode: data.response.status,
                message: "Error: vacio",
                error: data.error,
            });
        }
        else
        {
            return err({
                statusCode: data.response.status,
                message: "Error: vacio",
                error: data.error!,
            });
        }
    }
    catch
    {
        return err({
            statusCode: 503,
            message: "Servidor no disponible",
            error: null as Error,
        });
    }
}


import createClient from "openapi-fetch";
import type { paths } from "./api";
import { err, ok, Result } from "@/utils/result";

// FIXME: replace with env var URL
/**
 * Client for connecting with the backend
 */
export const backend = createClient<paths>({ baseUrl: "http://localhost:5233" });

type FetchError = {
    title: string
}

/**
 * Wraps a backend call, ensuring it never throws, and can be safely
 * used in server components/server actions without disrupting control flow.
 */
export async function wrapper<Data, Error>(fn: () => Promise<{ data?: Data, error?: Error }>): Promise<Result<Data, Error | FetchError>>
{
    try
    {
        const data = await fn();
        if (data.data)
        {
            return ok(data.data);
        }
        else if (data.error)
        {
            return err(data.error!);
        }
        else
        {
            return err({ title: "Backend error: invalid shape" });
        }
    }
    catch
    {
        return err({ title: "Fetch error" });
    }
}


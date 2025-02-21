"use server";

import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/variables";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { backend, FetchError, wrapper } from "@/types/backend";
import { ok, err, Result } from "@/utils/result";

export async function LoginAction(email: string, password: string)
    : Promise<Result<null, FetchError>>
{
    const loginPromise = wrapper(() => backend.POST("/api/Auth/login", {
        body: { email, password },
    }));
    const [data, error] = await loginPromise;
    if (error)
    {
        console.log("got error:");
        console.log(error);
        return err(error);
    }

    const cookieStore = await cookies();
    cookieStore.set({
        name: ACCESS_TOKEN_KEY,
        value: data.accessToken,
        httpOnly: true,
        expires: Date.now() + (data.accessExpiresIn * 1000),
        path: "/",
    });
    cookieStore.set({
        name: REFRESH_TOKEN_KEY,
        value: data.refreshToken,
        httpOnly: true,
        expires: Date.now() + (data.refreshExpiresIn * 1000),
        path: "/",
    });

    return ok(null);
}

export async function LogoutAction()
{
    const cookieStore = await cookies();
    cookieStore.delete(ACCESS_TOKEN_KEY);
    cookieStore.delete(REFRESH_TOKEN_KEY);
    redirect("/login");
}

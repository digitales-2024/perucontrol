"use server";

import { postApiAuthLogin } from "@/types";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/variables";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function LoginAction(email: string, password: string)
{
    try
    {
        const result = await postApiAuthLogin({
            body: { email, password },
            throwOnError: true,
        });

        const cookieStore = await cookies();
        const data = result.data!;
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
    }
    catch (result)
    {
        console.log(result);

        if (result instanceof TypeError)
        {
            console.log(result.cause);
        }

        // @ts-expect-error ...
        if (result?.status === 401) return { error: "Credenciales incorrectos" };

        return { error: "Error iniciando sesión" };
    }

    redirect("/");
}

export async function LogoutAction()
{
    const cookieStore = await cookies();
    cookieStore.delete(ACCESS_TOKEN_KEY);
    cookieStore.delete(REFRESH_TOKEN_KEY);
    redirect("/login");
}

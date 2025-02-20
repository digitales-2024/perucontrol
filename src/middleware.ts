import { NextResponse, NextRequest } from "next/server";

import { Result } from "./utils/result";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/variables";

const PUBLIC_ROUTES = ["/login", "/update-password"];

export async function middleware(request: NextRequest)
{
    const accessToken = request.cookies.get(ACCESS_TOKEN_KEY);
    const refreshToken = request.cookies.get(REFRESH_TOKEN_KEY);

    const isAuthenticated = !!accessToken && !!refreshToken;
    const { pathname } = request.nextUrl;

    if (PUBLIC_ROUTES.includes(pathname) && isAuthenticated)
    {
        devlog("public route, is auth, redirect...");

        const lastVisitedUrl = "/";
        const nextResponse = NextResponse.redirect(new URL(lastVisitedUrl, request.url));
        return nextResponse;
    }
    if (PUBLIC_ROUTES.includes(pathname) && !isAuthenticated)
    {
        devlog("public route, is not auth, continue");

        return NextResponse.next();
    }

    // if there's no refresh token, bail
    if (!refreshToken)
    {
        devlog(`no refresh token found! access is ${accessToken?.value}`);

        return logoutAndRedirectLogin(request);
    }

    // if there's no access token, attempt to refresh.
    // at this point there is a refresh token
    if (!accessToken)
    {
        // do session refresh here
        const [newCookies, err] = await refresh(refreshToken.value);
        if (err)
        {
            devlog("error refreshing!");
            console.log(err);
            return logoutAndRedirectLogin(request);
        }

        devlog("setting cookies");

        const response = NextResponse.next();

        newCookies.forEach((cookie) =>
        {
            const { name, value, options } = parseSetCookie(cookie);
            response.cookies.set({
                name,
                value,
                ...options,
            });
        });

        return response;
    }

    devlog("no cookie refresh performed, just continue");
    return NextResponse.next();
}

function parseSetCookie(cookieString: string)
{
    const pairs: Array<[string, string | boolean]> = cookieString
        .split(";")
        .map((pair) => pair.trim())
        .map((pair) =>
        {
            const [key, ...values] = pair.split("=");
            return [key.toLowerCase(), values.join("=") || true];
        });

    // Get the first pair which has the cookie name and value
    const [cookieName, cookieValue] = pairs[0];
    const cookieMap = new Map(pairs.slice(1));

    return {
        name: cookieName,
        value: cookieValue as string,
        options: {
            path: cookieMap.get("path") as string,
            maxAge: cookieMap.has("max-age")
                ? parseInt(cookieMap.get("max-age") as string, 10)
                : undefined,
            expires: cookieMap.has("expires")
                ? new Date(cookieMap.get("expires") as string)
                : undefined,
            httpOnly: cookieMap.get("httponly") === true,
            sameSite: cookieMap.has("samesite")
                ? ((
                    cookieMap.get("samesite") as string
                ).toLowerCase() as "strict")
                : undefined,
        },
    };
}

function logoutAndRedirectLogin(request: NextRequest)
{
    devlog("nuking cookies and redirecting to login\n\n");

    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(ACCESS_TOKEN_KEY);
    response.cookies.delete(REFRESH_TOKEN_KEY);
    return response;
}

async function refresh(refreshToken: string): Promise<Result<Array<string>, string>>
{
    try
    {
        const response = await fetch(
            `${process.env.INTERNAL_BACKEND_URL}/auth/refresh-token`,
            {
                method: "POST",
                headers: {
                    Cookie: `${REFRESH_TOKEN_KEY}=${refreshToken}`,
                },
            },
        );

        if (!response.ok)
        {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const newCookies = response.headers.getSetCookie();

        if (!newCookies || newCookies.length === 0)
        {
            return [
                // @ts-expect-error allowing null
                null,
                "El refresh fue exitoso, pero no contenia nuevas cookies",
            ];
        }

        return [newCookies, null];
    }
    catch (error)
    {
        console.error("Refresh token error:", error);

        return [
            // @ts-expect-error allowing null
            null,
            "Error refrescando token",
        ];
    }
}

function devlog(message: string)
{
    if (process.env.NODE_ENV === "development")
    {
        console.log(`\tDEBUG: ${message}`);
    }
}

export const config = {
    matcher: [
        "/((?!api|_next|_static|_vercel|favicon.ico|sitemap.xml).*)",
    ],
};


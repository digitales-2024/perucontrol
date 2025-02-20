import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_KEY } from "@/variables";
import { backend } from "@/types/backend";

export default async function AdminLayout({ children }: { children: React.ReactNode })
{
    const c = await cookies();
    const jwt = c.get(ACCESS_TOKEN_KEY);
    const userData = await backend.GET("/api/User", {
        headers: {
            Authorization: `Bearer ${jwt?.value}`,
        },
    });

    const user = userData.data!;

    return (
        <SidebarProvider>
            <AppSidebar user={user} />
            <SidebarInset>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}

import React from "react";
import { AppSidebar } from "@/components/app-sidebar-2";
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar";
import { backend, wrapper } from "@/types/backend";
import { cookies } from "next/headers";

async function getSidebarStateFromServerCookies(): Promise<boolean>
{
    const cookieStore = await cookies();
    const sidebarState = cookieStore.get("sidebar_state");
    return sidebarState?.value === "true";
}

export default async function AdminLayout({ children }: { children: React.ReactNode })
{
    const [user, err] = await wrapper((auth) => backend.GET("/api/User", auth));
    const defaultOpen = await getSidebarStateFromServerCookies();

    if (err)
    {
        return (
            <SidebarProvider defaultOpen={defaultOpen}>
                <AppSidebar
                    user={{
                        username: "-",
                        name: "-",
                        email: "-",
                    }}
                />
                <SidebarInset>
                    {children}
                </SidebarInset>
            </SidebarProvider>
        );
    }

    return (
        <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar variant="sidebar" user={user} />
            <SidebarInset>
                <div className="sticky z-10 top-0 left-0 w-full">
                    <div className="absolute z-10 top-0 left-0 w-full h-screen bg-[url(/logo_perucontrol_com.dark.plain.svg)] bg-contain bg-no-repeat bg-center opacity-5" />
                </div>
                <div className="relative z-20 px-1 py-2 md:px-6 md:py-4 ">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}

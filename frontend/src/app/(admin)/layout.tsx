import React from "react";
import { AppSidebar } from "@/components/app-sidebar-2";
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar";
import { backend, wrapper } from "@/types/backend";

export default async function AdminLayout({ children }: { children: React.ReactNode })
{
    const [user, err] = await wrapper((auth) => backend.GET("/api/User", auth));
    if (err)
    {
        return (
            <SidebarProvider>
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
        <SidebarProvider>
            <AppSidebar variant="sidebar" user={user} />
            <SidebarInset>
                <div className="sticky z-10 top-0 left-0 w-full">
                    <div className="absolute z-10 top-0 left-0 w-full h-screen bg-[url(/logo_perucontrol_com.svg)] bg-contain bg-no-repeat bg-center opacity-5" />
                </div>
                <div className="relative z-20 px-1 py-2 md:px-6 md:py-4 ">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}

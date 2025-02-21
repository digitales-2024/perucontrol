import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
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
        console.log(err);
        return "No autorizado :c";
    }

    return (
        <SidebarProvider>
            <AppSidebar user={user} />
            <SidebarInset>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}

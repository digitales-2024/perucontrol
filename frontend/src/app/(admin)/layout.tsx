import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
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
            <AppSidebar user={user} />
            <SidebarInset className="relative">
                <SidebarTrigger className="absolute top-2 left-2 z-50" />
                <div className="absolute z-10 top-0 left-0 w-full h-full bg-[url(/Isotipo.png)] bg-contain bg-no-repeat bg-center opacity-5" />
                <div className="relative z-20 px-6 py-8">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}

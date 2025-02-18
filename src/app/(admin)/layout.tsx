import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode })
{
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <SidebarTrigger />
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}

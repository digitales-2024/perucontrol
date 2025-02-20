"use client";

import * as React from "react";
import {
    BugOff,
    Command,
    HandCoins,
    PieChart,
    Settings2,
    ShieldCheck,
    Users,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
        {
            title: "Dashboard",
            url: "#",
            icon: PieChart,
        },
        {
            title: "Cotizaciones",
            url: "#",
            icon: HandCoins,
        },
        {
            title: "Servicios",
            url: "#",
            icon: BugOff,
        },
        {
            title: "Clientes",
            url: "#",
            icon: Users,
        },
        {
            title: "Certificaciones",
            url: "#",
            icon: ShieldCheck,
            items: [
                {
                    title: "Emisión de Certificados",
                    url: "#",
                },
                {
                    title: "Calendario",
                    url: "#",
                },
            ],
        },
        {
            title: "Ajustes",
            url: "#",
            icon: Settings2,
            items: [
                {
                    title: "Cuenta",
                    url: "#",
                },
                {
                    title: "Datos de la empresa",
                    url: "#",
                },
                {
                    title: "Exportar datos",
                    url: "#",
                },
            ],
        },
    ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>)
{
    return (
        <Sidebar variant="inset" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="#">
                                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <Command className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">
                                        Acme Inc
                                    </span>
                                    <span className="truncate text-xs">
                                        Enterprise
                                    </span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
        </Sidebar>
    );
}

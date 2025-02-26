"use client";

import * as React from "react";
import Image from "next/image";
import {
    BugOff,
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
import Link from "next/link";
import { components } from "@/types/api";

const data = {
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
            url: "/clients",
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

type User = components["schemas"]["UserReturn"]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar> & { user: User })
{
    return (
        <Sidebar variant="inset" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/" className="my-2">
                                <div className="text-center w-full">
                                    <Image
                                        className="inline-block"
                                        src="/logo.png"
                                        alt="Logo"
                                        width={80}
                                        height={80}
                                    />
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={props.user} />
            </SidebarFooter>
        </Sidebar>
    );
}

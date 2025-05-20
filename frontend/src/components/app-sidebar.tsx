"use client";

import * as React from "react";
import Image from "next/image";
import {
    BugOff,
    HandCoins,
    PieChart,
    Settings2,
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
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { components } from "@/types/api";

const data = {
    navMain: [
        {
            title: "Inicio",
            url: "/",
            icon: PieChart,
        },
        {
            title: "Clientes",
            url: "/clients",
            icon: Users,
            items: [
                {
                    title: "Todos los clientes",
                    url: "/clients",
                },
                {
                    title: "Nuevo cliente",
                    url: "/clients/nuevo",
                },
            ],
        },
        {
            title: "Cotizaciones",
            url: "/cotizaciones",
            icon: HandCoins,
            items: [
                {
                    title: "Todas las cotizaciones",
                    url: "/cotizaciones",
                },
                {
                    title: "Nueva cotización",
                    url: "/cotizaciones/nuevo",
                },
            ],
        },
        {
            title: "Servicios",
            url: "/projects",
            icon: BugOff,
            items: [
                {
                    title: "Todos los servicios",
                    url: "/projects",
                },
                {
                    title: "Nuevo servicio",
                    url: "/projects/create",
                },
                {
                    title: "Fichas de operacion",
                    url: "/projects/ver/ficha",
                },
                {
                    title: "Certificados",
                    url: "/projects/ver/certificado",
                },
            ],
        },
        {
            title: "Ajustes",
            url: "/business",
            icon: Settings2,
            items: [
                {
                    title: "Datos de la empresa",
                    url: "/business",
                },
                {
                    title: "Productos",
                    url: "/products",
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
                        <Link href="/" className="my-2">
                            <div className="text-center w-full">
                                <Image
                                    className="inline-block"
                                    alt="Logo"
                                    src="/logo_perucontrol_com_fondo.plain.svg"
                                    width={160}
                                    height={160}
                                />
                            </div>
                        </Link>
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

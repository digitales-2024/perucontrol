"use client";

import * as React from "react";
import {
    BriefcaseBusiness,
    BugOff,
    FileText,
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
    SidebarRail,
} from "@/components/ui/sidebar";
import { components } from "@/types/api";
import Link from "next/link";

const data = {
    navMain: [
        {
            title: "Inicio",
            url: "/",
            icon: PieChart,
        },
        {
            title: "Clientes",
            url: "#",
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
            title: "Proveedores",
            url: "#",
            icon: BriefcaseBusiness,
            items: [
                {
                    title: "Todos los proveedores",
                    url: "/suppliers",
                },
                {
                    title: "Nuevo proveedor",
                    url: "/suppliers/nuevo",
                },
            ],
        },
        {
            title: "Cotizaciones",
            url: "#",
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
            url: "#",
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
                    url: "/projects/tablas/fichas",
                },
                {
                    title: "Registro de Roedores",
                    url: "#",
                },
                {
                    title: "Certificados",
                    url: "/projects/tablas/certificado",
                },
            ],
        },
        {
            title: "Ordenes de Compra",
            url: "#",
            icon: FileText,
            items: [
                {
                    title: "Todas las ordenes",
                    url: "/purchase-orders",
                },
                {
                    title: "Nueva orden de compra",
                    url: "/purchase-orders/nuevo",
                },
            ],
        },
        {
            title: "Ajustes",
            url: "#",
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
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <Link href="/" className="my-2">
                    <div className="text-center w-full bg-white hover:bg-zinc-100 transition-colors rounded-xl">
                        <img
                            className="inline-block"
                            alt="Logo"
                            src="/logo_perucontrol_com.dark.plain.svg"
                            width={160}
                            height={160}
                        />
                    </div>
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={props.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}


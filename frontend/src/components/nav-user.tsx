"use client";

import React, { useState } from "react";
import {
    ChevronsUpDown,
    LogOut,
    User,
} from "lucide-react";

import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { LogoutAction } from "@/app/(auth)/login/actions";
import { components } from "@/types/api";
import { UserEditDialog } from "./UserEditDialog";
import { AvatarImage } from "@radix-ui/react-avatar";

type User = components["schemas"]["UserReturn"]

export function NavUser({
    user,
}: {
    user: User
})
{
    const { isMobile } = useSidebar();
    const [openDialog, setOpenDialog] = useState(false);

    const userInitials = user.name.split(" ")
        .map((x) => x[0])
        .slice(0, 2)
        .join("");

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-full">
                                <AvatarImage src="/profiles/foto_perfil_fem.jpg" />
                                {/* <AvatarImage src="/profiles/foto_perfil_masc.png" /> */}
                                <AvatarFallback className="rounded-full text-black">
                                    {userInitials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">
                                    {user.name}
                                </span>
                                <span className="truncate text-xs">
                                    {user.email}
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuItem onClick={() => setOpenDialog(true)}>
                            <User />
                            Editar perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={LogoutAction}>
                            <LogOut />
                            Cerrar sesión
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
            <UserEditDialog open={openDialog} onOpenChange={setOpenDialog} user={user} />
        </SidebarMenu>
    );
}

"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useState } from "react";

export function NavMain({
    items,
}: {
    items: Array<{
        title: string
        url: string
        icon: LucideIcon
        isActive?: boolean
        items?: Array<{
            title: string
            url: string
        }>
    }>
})
{
    return (
        <SidebarGroup>
            <SidebarMenu>
                {items.map((item) =>
                {
                    const [expandOpen, setExpandOpen] = useState(true);

                    return (
                        <Collapsible key={item.title} asChild open={expandOpen} onOpenChange={setExpandOpen}>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={item.title}
                                    onClick={() =>
                                    {
                                        if (item.items?.length)
                                        {
                                            setExpandOpen((x) => !x);
                                        }
                                    }}
                                >
                                    <a href={item.url}>
                                        <item.icon />
                                        <span>
                                            {item.title}
                                        </span>
                                    </a>
                                </SidebarMenuButton>
                                {item.items?.length ? (
                                    <>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuAction className="data-[state=open]:rotate-90">
                                                <ChevronRight />
                                                <span className="sr-only">
                                                    Toggle
                                                </span>
                                            </SidebarMenuAction>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {item.items?.map((subItem) => (
                                                    <SidebarMenuSubItem key={subItem.title}>
                                                        <SidebarMenuSubButton asChild>
                                                            <a href={subItem.url}>
                                                                <span>
                                                                    {subItem.title}
                                                                </span>
                                                            </a>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </>
                                ) : null}
                            </SidebarMenuItem>
                        </Collapsible>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}

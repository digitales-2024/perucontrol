"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";

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
import Link from "next/link";

type NavMainItem = {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    items?: Array<{
        title: string
        url: string
    }>
}

export function NavMain({
    items,
}: {
    items: Array<NavMainItem>
})
{
    const pathname = usePathname();

    return (
        <SidebarGroup>
            <SidebarMenu>
                {items.map((item, idx) => <SidebarMenuItemLocal key={idx} item={item} pathname={pathname} />)}
            </SidebarMenu>
        </SidebarGroup>
    );
}

function SidebarMenuItemLocal({ item, pathname }: { item: NavMainItem, pathname: string })
{
    // Check if this item or any of its subitems is active
    const isItemActive = pathname === item.url ||
        (pathname.startsWith(item.url) && item.url !== "/");

    const [expandOpen, setExpandOpen] = useState(isItemActive);

    return (
        <Collapsible key={item.title} asChild open={expandOpen} onOpenChange={setExpandOpen}>
            <SidebarMenuItem>
                <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    data-active={isItemActive}
                    className="data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
                    onClick={() =>
                    {
                        if (item.items?.length)
                        {
                            setExpandOpen((x) => !x);
                        }
                    }}
                >
                    <Link href={item.url}>
                        <item.icon />
                        <span>
                            {item.title}
                        </span>
                    </Link>
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
                                        <SidebarMenuSubButton
                                            asChild
                                            data-active={subItem.url === pathname}
                                            className="data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
                                        >
                                            <Link href={subItem.url}>
                                                <span>
                                                    {subItem.title}
                                                </span>
                                            </Link>
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
}

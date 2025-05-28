"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useRef, useCallback } from "react";
import Link from "next/link";

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
    useSidebar,
} from "@/components/ui/sidebar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

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
    const { state, isMobile } = useSidebar();

    // Check if this item or any of its subitems is active
    const isActiveBasedOnParentUrl = pathname === item.url ||
        (pathname.startsWith(item.url) && item.url !== "/");

    const isActiveBasedOnChildUrl = item.items?.some((subItem) => subItem.url === pathname) ?? false;

    const isItemActive = isActiveBasedOnParentUrl || isActiveBasedOnChildUrl;

    const [expandOpen, setExpandOpen] = useState(isItemActive);
    const [hoverOpen, setHoverOpen] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Determine if we should show hover popover
    const isCollapsed = state === "collapsed" && !isMobile;
    const hasChildren = item.items && item.items.length > 0;
    const shouldShowHoverMenu = isCollapsed && hasChildren;

    const handleMouseEnter = useCallback(() =>
    {
        if (timeoutRef.current)
        {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setHoverOpen(true);
    }, []);

    const handleMouseLeave = useCallback(() =>
    {
        timeoutRef.current = setTimeout(() =>
        {
            setHoverOpen(false);
        }, 150);
    }, []);

    // When collapsed with children, render with popover
    if (shouldShowHoverMenu)
    {
        return (
            <SidebarMenuItem className="font-display group-data-[state=collapsed]:flex group-data-[state=collapsed]:justify-center">
                <Popover open={hoverOpen} onOpenChange={setHoverOpen}>
                    <PopoverTrigger asChild>
                        <SidebarMenuButton
                            asChild
                            tooltip={item.title}
                            data-active={isItemActive}
                            className="data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <Link href={item.url}>
                                <item.icon />
                                <span>
                                    {item.title}
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    </PopoverTrigger>
                    <PopoverContent
                        side="right"
                        align="center"
                        sideOffset={0}
                        className="w-48 p-1"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <div className="grid gap-1">
                            <div className="px-2 py-1.5 text-sm font-semibold">
                                {item.title}
                            </div>
                            {item.items?.map((subItem) => (
                                <Link
                                    key={subItem.title}
                                    href={subItem.url}
                                    className={`
                                        flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm 
                                        hover:bg-accent hover:text-accent-foreground 
                                        focus:bg-accent focus:text-accent-foreground 
                                        outline-none transition-colors
                                        ${subItem.url === pathname ? "bg-accent text-accent-foreground" : ""}
                                    `}
                                >
                                    {subItem.title}
                                </Link>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
            </SidebarMenuItem>
        );
    }

    // Default expanded behavior
    return (
        <Collapsible key={item.title} asChild open={expandOpen} onOpenChange={setExpandOpen}>
            <SidebarMenuItem className="font-display group-data-[state=collapsed]:flex group-data-[state=collapsed]:justify-center">
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
                                            className="data-[active=true]:text-accent data-[active=true]:underline"
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

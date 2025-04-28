"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function ProjectsTableToolbarActions({})
{
    return (
        <div className="flex w-fit flex-wrap items-center gap-2">
            <Link href="/projects/create">
                <Button className="w-28 text-xs">
                    <Plus />
                    Crear Nuevo
                </Button>
            </Link>
        </div>
    );
}

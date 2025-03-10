"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ProjectsTableToolbarActions({})
{
    return (
        <div className="flex w-fit flex-wrap items-center gap-2">
            <Link href="/projects/create">
                <Button>
                    Nuevo Servicio
                </Button>
            </Link>
        </div>
    );
}

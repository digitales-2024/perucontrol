"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export function QuotationTableToolbarActions({})
{
    return (
        <div>
            <Link href="/cotizaciones/nuevo">
                <Button>
                    <Plus />
                    Crear cotización
                </Button>
            </Link>
        </div>
    );
}

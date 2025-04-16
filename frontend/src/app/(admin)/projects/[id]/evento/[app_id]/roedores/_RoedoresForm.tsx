"use client";

import { RodentControlForm } from "@/app/(admin)/projects/_components/RodentRegisterForm";
import { components } from "@/types/api";

export function RoedoresForm({
    project,
}: {
    project: components["schemas"]["ProjectSummarySingle"];
})
{
    return (
        <div>
            <RodentControlForm
                project={project}
                onOpenChange={() =>
                { }}
            />
        </div>
    );
}

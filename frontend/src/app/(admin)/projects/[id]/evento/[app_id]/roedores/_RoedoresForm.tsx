"use client";

import { RodentControlForm } from "@/app/(admin)/projects/_components/RodentRegisterForm";
import { components } from "@/types/api";

type ProjectSummarySingle = components["schemas"]["ProjectSummarySingle"];
type ProjectAppointment = ProjectSummarySingle["appointments"][number]

export function RoedoresForm({
    project,
    appointment,
}: {
    project: components["schemas"]["ProjectSummarySingle"];
    appointment: ProjectAppointment,
})
{
    return (
        <div>
            <RodentControlForm
                project={project}
                appointment={appointment}
            />
        </div>
    );
}

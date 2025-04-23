"use client";

import { RodentControlForm } from "@/app/(admin)/projects/_components/RodentRegisterForm";
import { components } from "@/types/api";

type ProjectSummarySingle = components["schemas"]["ProjectSummarySingle"];
type ProjectAppointment = ProjectSummarySingle["appointments"][number]

export function RoedoresForm({
    project,
    appointment,
    rodent,
}: {
    project: components["schemas"]["ProjectSummarySingle"];
    appointment: ProjectAppointment,
    rodent: components["schemas"]["RodentRegister"],
})
{
    return (
        <div>
            <RodentControlForm
                project={project}
                appointment={appointment}
                rodent={rodent}
            />
        </div>
    );
}

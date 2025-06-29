"use client";

import { DownloadProjectForm } from "@/app/(admin)/projects/_components/DownloadProjectForm";
import { components } from "@/types/api";

type ProjectSummarySingle = components["schemas"]["ProjectSummarySingle"];
type ProjectAppointment = ProjectSummarySingle["appointments"][number]

export function OperationsSheetForm({
    project,
    client,
    appointment,
}: {
    project: components["schemas"]["ProjectSummarySingle"];
    client: components["schemas"]["Client"];
    appointment: ProjectAppointment,
})
{
    return (
        <div>
            <DownloadProjectForm
                project={project}
                appointment={appointment}
                client={client}
            />
        </div>
    );
}


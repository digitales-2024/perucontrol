"use client";

import { DownloadProjectForm } from "@/app/(admin)/projects/_components/DownloadProjectForm";
import { Project } from "@/app/(admin)/projects/types";
import { components } from "@/types/api";

type ProjectSummarySingle = components["schemas"]["ProjectSummarySingle"];
type ProjectAppointment = ProjectSummarySingle["appointments"][number]

export function OperationsSheetForm({
    project,
    client,
    appointment,
}: {
    project: Project
    client: components["schemas"]["Client"];
    appointment: ProjectAppointment,
})
{
    return (
        <div>
            <DownloadProjectForm
                project={project}
                client={client}
                appointment={appointment}
                onOpenChange={() =>
                { }}
            />
        </div>
    );
}

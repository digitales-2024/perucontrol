"use client";

import { DownloadCertificateForm } from "@/app/(admin)/projects/_components/DownloadCertificate";
import { components } from "@/types/api";

type ProjectSummarySingle = components["schemas"]["ProjectSummarySingle"];
type ProjectAppointment = ProjectSummarySingle["appointments"][number]

export function CertificateForm({
    project,
    appointment,
}: {
    project: components["schemas"]["ProjectSummarySingle"];
    appointment: ProjectAppointment,
})
{
    return (
        <div>
            <DownloadCertificateForm
                project={project}
                appointment={appointment}
                onOpenChange={() =>
                { }}
            />
        </div>
    );
}

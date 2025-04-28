"use client";

import { DownloadCertificateForm } from "@/app/(admin)/projects/_components/DownloadCertificate";
import { components } from "@/types/api";

type ProjectSummarySingle = components["schemas"]["ProjectSummarySingle"];
type ProjectAppointment = ProjectSummarySingle["appointments"][number]

export function CertificateForm({
    project,
    appointment,
    certificate,
}: {
    project: components["schemas"]["ProjectSummarySingle"];
    appointment: ProjectAppointment,
    certificate: components["schemas"]["Certificate"]
})
{
    return (
        <div>
            <DownloadCertificateForm
                project={project}
                appointment={appointment}
                certificate={certificate}
                onOpenChange={() =>
                { }}
            />
        </div>
    );
}

"use client";

import { DownloadCertificateForm } from "@/app/(admin)/projects/_components/DownloadCertificate";
import { components } from "@/types/api";

type ProjectSummarySingle = components["schemas"]["ProjectSummarySingle"];
type ProjectAppointment = ProjectSummarySingle["appointments"][number]

export function CertificateForm({
    project,
    // projectOperationSheet,
    // client,
    appointment,
}: {
    project: components["schemas"]["ProjectSummarySingle"];
    // projectOperationSheet: components["schemas"]["ProjectOperationSheet"]
    // client: components["schemas"]["Client"];
    appointment: ProjectAppointment,
})
{
    return (
        <div>
            <DownloadCertificateForm
                project={project}
                // projectOperationSheet={projectOperationSheet}
                appointment={appointment}
                // client={client}
                onOpenChange={() =>
                { }}
            />
        </div>
    );
}

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
                onOpenChange={() =>
                { }}
            />
        </div>
    );
}

/* defaultValues: {
            projectAppointmentId: project.id,
            operationDate: appointment.actualDate!,
            enterTime: operationSheet.enterTime,
            leaveTime: operationSheet.leaveTime,
            razonSocial: client.razonSocial ?? client.name,
            address: project.address,
            businessType: client.businessType ?? "",
            treatedAreas: operationSheet.treatedAreas,
            service: serviceNames,
            certificateNumber: appointment.certificateNumber !== null ? String(appointment.certificateNumber) : "",
            insects: operationSheet.insects,
            rodents: operationSheet.rodents,
            rodentConsumption: "Partial",
            otherPlagues: operationSheet.otherPlagues,
            insecticide: operationSheet.insecticide,
            insecticide2: operationSheet.insecticide,
            rodenticide: operationSheet.rodenticide,
            desinfectant: operationSheet.desinfectant,
            otherProducts: operationSheet.otherProducts,
            insecticideAmount: operationSheet.insecticideAmount,
            insecticideAmount2: operationSheet.insecticideAmount2,
            rodenticideAmount: operationSheet.rodenticideAmount,
            desinfectantAmount: operationSheet.desinfectantAmount,
            otherProductsAmount: operationSheet.otherProductsAmount,
            staff1: operationSheet.staff1,
            staff2: operationSheet.staff2,
            staff3: operationSheet.staff3,
            staff4: operationSheet.staff4,
            aspersionManual: false,
            aspersionMotor: false,
            nebulizacionFrio: false,
            nebulizacionCaliente: false,
            colocacionCebosCebaderos: operationSheet.colocacionCebosCebaderos,
            numeroCeboTotal: operationSheet.numeroCeboTotal,
            numeroCeboRepuestos: operationSheet.numeroCeboRepuestos,
            nroPlanchasPegantes: operationSheet.nroPlanchasPegantes,
            nroJaulasTomahawk: operationSheet.nroJaulasTomahawk,
            degreeInsectInfectivity: "Moderate",
            degreeRodentInfectivity: "Moderate",
            observations: operationSheet.observations,
            recommendations: operationSheet.recommendations,
        }, */

import { HeaderPage } from "@/components/common/HeaderPage";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { TreatmentProductForm } from "./_components/TreatmentProduct";
import { backend, wrapper } from "@/types/backend";
import { reportTitles } from "../types/reports";

interface Props {
    params: Promise<{
        app_id: string,
        report_id: string,
    }>
}

export default async function ProjectsPage({ params }: Props)
{
    const { app_id: appointmentId, report_id: reportId } = await params;

    const [products, error] = await wrapper((auth) => backend.GET("/api/Appointment/{appointmentId}/SheetProductNames", {
        ...auth,
        params: {
            path: { appointmentId },
        },
    }));

    const [appointment, appointmentError] = await wrapper((auth) => backend.GET("/api/Appointment/{id}", {
        ...auth,
        params: {
            path: {
                id: appointmentId,
            },
        },
    }));
    const [treatmentProducts, errorTreatmentProducts] = await wrapper((auth) => backend.GET("/api/Appointment/{appointmentid}/TreatmentProduct", {
        ...auth,
        params: {
            path: { appointmentid: appointmentId },
        },
    }));

    if (error || appointmentError)
    {
        console.error("Error getting all products:", error);
        return (
            <div>
                Error getting all products
            </div>
        );
    }

    if (errorTreatmentProducts)
    {
        console.error("Error getting treatment products:", errorTreatmentProducts);
        return (
            <div>
                Error getting treatment products
            </div>
        );
    }
    return (
        <>
            <HeaderPage
                title="Gestión de Productos"
                breadcrumbs={(
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/projects">
                                    Todos los servicios
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink href={`/projects/${appointment.project.id}`}>
                                    Servicio #
                                    {appointment.project.projectNumber}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink href={`/projects/${appointment.project.id}/${appointmentId}`}>
                                    Fecha #
                                    {appointment.appointmentNumber}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink href={`/projects/${appointment.project.id}/evento/${appointmentId}/informes/${reportId}`}>
                                    {reportTitles[reportId] ?? "Informe"}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>
                                    Productos
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                )}
            />
            <TreatmentProductForm products={products} appointmentId={appointmentId} treatmentProducts={treatmentProducts} />
        </>
    );
}

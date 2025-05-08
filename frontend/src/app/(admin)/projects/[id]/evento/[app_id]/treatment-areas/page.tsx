import { HeaderPage } from "@/components/common/HeaderPage";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb";
import { backend, wrapper } from "@/types/backend";
import { TreatmentAreasForm } from "./_components/TreatmentAreas";

interface Props {
  params: Promise<{
      app_id: string
  }>
}

export default async function ProjectsPage({ params }: Props)
{
    const { app_id: appointmentId } = await params;

    const [treatmentAreas, error] = await wrapper((auth) => backend.GET("/api/Appointment/{appointmentid}/TreatmentArea", {
        ...auth,
        params: {
            path: {
                appointmentid: appointmentId,
            },
        },
    }));

    if (error)
    {
        console.error("Error getting all products:", error);
        return (
            <div>
                Error Obteniendo todos los proyectos
            </div>
        );
    }

    const [treatmentProducts, errorTreatmentProducts] = await wrapper((auth) => backend.GET("/api/Appointment/{appointmentid}/TreatmentProduct", {
        ...auth,
        params: {
            path: { appointmentid: appointmentId },
        },
    }));

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
                title="Gestión de Áreas de Tratamiento"
                breadcrumbs={(
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/projects">
                                    Todas las áreas de tratamiento
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                )}
            />
            <TreatmentAreasForm treatmentAreas={treatmentAreas} treatmentProducts={treatmentProducts} appointmentId={appointmentId} />
        </>
    );
}

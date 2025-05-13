import { HeaderPage } from "@/components/common/HeaderPage";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb";
import { TreatmentProductForm } from "./_components/TreatmentProduct";
import { backend, wrapper } from "@/types/backend";

interface Props {
  params: Promise<{
      app_id: string
  }>
}

export default async function ProjectsPage({ params }: Props)
{
    const { app_id: appointmentId } = await params;

    const [products, error] = await wrapper((auth) => backend.GET("/api/Product", { ...auth }));

    if (error)
    {
        console.error("Error getting all products:", error);
        return (
            <div>
                Error getting all products
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
                title="Gestión de Productos"
                breadcrumbs={(
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/projects">
                                    Todos los productos
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                )}
            />
            <TreatmentProductForm products={products} appointmentId={appointmentId} treatmentProducts={treatmentProducts} />
        </>
    );
}

import { HeaderPage } from "@/components/common/HeaderPage";
import { ProductsDataTable } from "./_components/ProductsDataTable";
import { backend, wrapper } from "@/types/backend";
import ErrorPage from "@/components/ErrorPage";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb";

export default async function ProductsPage()
{
    const [products, prodError] = await wrapper((auth) => backend.GET("/api/Product", { ...auth }));

    if (prodError)
    {
        console.error("Error getting all products:", prodError);
        return (
            <>
                <HeaderPage
                    title="Información de Productos"  description="Gestiona los productos de tu empresa"
                    breadcrumbs={(
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/products">
                                        Todos los productos
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    )}
                />
                <ErrorPage />
            </>
        );
    }

    return (
        <div className="space-y-4">
            <HeaderPage title="Información de Productos" />
            <ProductsDataTable data={products} />
        </div>
    );
}

import { backend, wrapper } from "@/types/backend";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { HeaderPage } from "@/components/common/HeaderPage";
import ErrorPage from "@/components/ErrorPage";
import { SuppliersDataTable } from "./_components/table/SuppliersDataTable";
import { columns } from "./_components/table/SuppliersColumns";

export default async function SuppliersPage()
{
    const [suppliers, error] = await wrapper((auth) => backend.GET("/api/Supplier", { ...auth }));
    if (error)
    {
        console.error("Error getting all clients:", error);
        return (
            <>
                <HeaderPage
                    title="Gestión de proveedores"
                    description="Gestiona los proveedores de tu empresa"
                    breadcrumbs={
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/suppliers">
                                        Todos los proveedores
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    }
                />
                <ErrorPage />
            </>
        );
    }

    const formattedSuppliers = suppliers.map((supplier) => ({
        ...supplier,
        id: supplier.id ?? "-", // Si no hay id convertir el null a un string vacio
        rucNumber: supplier.rucNumber ?? "-", // Si no hay RUC convertir el null a un string vacio
        businessType: supplier.businessType ?? "-", // Si no hay razon social, convertir el null a un string vacio
        contactName: supplier.contactName ?? "-", // Si no hay nombre de contacto, convertir el null a un string vacio
    }));

    return (
        <>
            <HeaderPage
                title="Gestión de proveedores"
                description="Gestiona los proveedores de tu empresa"
                breadcrumbs={
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/suppliers">
                                    Todos los proveedores
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                }
            />
            <SuppliersDataTable columns={columns} data={formattedSuppliers} />
        </>
    );
}

import { HeaderPage } from "@/components/common/HeaderPage";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CreateSupplier } from "./_components/create/CreateSupplier";

export default async function NewSupplierPage()
{
    return (
        <>
            <HeaderPage
                title="Crear proveedor"
                description="Crea un nuevo proveedor"
                breadcrumbs={
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/suppliers">
                                    Todos los proveedores
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>
                                    Crear proveedor
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                }
            />
            <CreateSupplier />
        </>
    );
}

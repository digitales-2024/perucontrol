import { HeaderPage } from "@/components/common/HeaderPage";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import CreatePurchaseOrder from "./_components/create/CreatePurchaseOrder";

export default async function NewSupplierPage()
{
    return (
        <>
            <HeaderPage
                title="Crear ordén de compra"
                description="Crea una nueva ordén de compra"
                breadcrumbs={
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/purchase-orders">
                                    Todos las órdenes de compra
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>
                                    Crear ordén de compra
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                }
            />
            <CreatePurchaseOrder />
        </>
    );
}

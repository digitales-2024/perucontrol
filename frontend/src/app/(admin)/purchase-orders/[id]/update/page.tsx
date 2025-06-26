import { HeaderPage } from "@/components/common/HeaderPage";
import { GetPurchaseOrderById } from "../../_actions/PurchaseOrdersActions";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import ErrorPage from "@/components/ErrorPage";
import UpdatePurchaseOrderComponent from "./_components/UpdatePurchaseOrder";

interface UpdatePurchaseOrderPageProps {
    params: { id: string };
}

export default async function UpdatePurchaseOrderPage({ params }: UpdatePurchaseOrderPageProps)
{
    const [purchaseOrder, error] = await GetPurchaseOrderById(params.id);
    if (error)
    {
        console.error("Error getting purchase orders:", error);
        return (
            <>
                <HeaderPage
                    title="Gestión de Órdenes de Compra"
                    description="Gestiona las órdenes de compra de tu empresa"
                    breadcrumbs={
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/purchase-orders">
                                        Todas las órdenes de compra
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
    return (
        <>
            <HeaderPage
                title="Editar Orden de Compra"
                breadcrumbs={(
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/purchase-orders">
                                    Todas las órdenes de compra
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/purchase-orders">
                                    Orden de Compra #
                                    {purchaseOrder.number}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>
                                    Editar
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                )}
            />
            <UpdatePurchaseOrderComponent purchaseOrder={purchaseOrder} purchaseOrderId={params.id} />
        </>
    );
}

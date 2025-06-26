import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { HeaderPage } from "@/components/common/HeaderPage";
import ErrorPage from "@/components/ErrorPage";
import { columns } from "./_components/table/PurchaseOrdersColumns";
import { GetPurchaseOrders } from "./_actions/PurchaseOrdersActions";
import { PurchaseOrdersDataTable } from "./_components/table/PurchaseOrdersDataTable";

interface PageProps {
	searchParams: Promise<{
		startDate?: string;
		endDate?: string;
		supplierId?: string;
		currency?: string;
		status?: string;
	}>;
}

export default async function PurchaseOrdersPage({ searchParams }: PageProps)
{
    const params = await searchParams;

    // Usar la función GetPurchaseOrders con los parámetros de filtro
    const [purchaseOrders, error] = await GetPurchaseOrders({
        startDate: params.startDate,
        endDate: params.endDate,
        supplierId: params.supplierId,
        currency: params.currency
            ? Number.parseInt(params.currency, 10)
            : undefined,
        status: params.status ? Number.parseInt(params.status, 10) : undefined,
    });

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

    const formattedPurchaseOrders = purchaseOrders.map((order) => ({
        ...order,
        id: order.id ?? "-",
        number: order.number ?? 0,
        supplier: {
            ...order.supplier,
            supplierNumber: order.supplier?.supplierNumber ?? 0,
            businessName: order.supplier?.businessName ?? "-",
            rucNumber: order.supplier?.rucNumber ?? "-",
            contactName: order.supplier?.contactName ?? "-",
            name: order.supplier?.name ?? "-",
            fiscalAddress: order.supplier?.fiscalAddress ?? "-",
            email: order.supplier?.email ?? "-",
            phoneNumber: order.supplier?.phoneNumber ?? "-",
        },
        total: order.total ?? 0,
        status: order.status ?? 0,
        currency: order.currency ?? 0,
        issueDate: order.issueDate ?? new Date().toISOString(),
        products: order.products ?? [],
    }));

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
            <PurchaseOrdersDataTable
                columns={columns}
                data={formattedPurchaseOrders}
                currentFilters={{
                    startDate: params.startDate,
                    endDate: params.endDate,
                    supplierId: params.supplierId,
                    currency: params.currency,
                    status: params.status,
                }}
            />
        </>
    );
}

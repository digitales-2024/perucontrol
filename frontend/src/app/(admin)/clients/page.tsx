import { ClientsDataTable } from "./_components/ClientsDataTable";
import { columns } from "./_components/ClientsColumns";
import { backend, wrapper } from "@/types/backend";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { HeaderPage } from "@/components/common/HeaderPage";
import ErrorPage from "@/components/ErrorPage";

export default async function ClientsPage()
{
    const [clients, error] = await wrapper((auth) => backend.GET("/api/Client", { ...auth }));
    if (error)
    {
        console.error("Error getting all clients:", error);
        return (
            <>
                <HeaderPage
                    title="Gestión de clientes" description="Gestiona los clientes de tu empresa"
                    breadcrumbs={(
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/clients">
                                        Todos los clientes
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

    const formattedClients = clients.map((client) => ({
        ...client,
        id: client.id ?? "-", // Si no hay id convertir el null a un string vacio
        clientLocations: client.clientLocations?.filter((location) => location.address).map((location) => ({
            address: location.address,
        })) || [],
        razonSocial: client.razonSocial ?? "-",  // Si no hay razon social, convertir el null a un string vacio
        contactName: client.contactName ?? "-",  // Si no hay nombre de contacto, convertir el null a un string vacio
    }));

    return (
        <>
            <HeaderPage
                title="Gestión de clientes" description="Gestiona los clientes de tu empresa"
                breadcrumbs={(
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/clients">
                                    Todos los clientes
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                )}
            />
            <ClientsDataTable columns={columns} data={formattedClients} />
        </>
    );
}

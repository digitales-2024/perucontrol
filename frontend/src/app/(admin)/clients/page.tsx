import { HeaderPage } from "@/components/common/HeaderPage";
import { Shell } from "@/components/common/Shell";
import { ClientsDataTable } from "./_components/ClientsDataTable";
import { columns } from "./_components/ClientsColumns";
import { backend, wrapper } from "@/types/backend";

export default async function ClientsPage()
{
    const [clients, error] = await wrapper((auth) => backend.GET("/api/Client", { ...auth }));

    if (error)
    {
        console.error("Error getting all clients:", error);
        return (
            <Shell>
                <HeaderPage title="Gestión de clientes" description="No se pudieron cargar los clientes." />
                <p className="text-red-500 text-sm">
                    Ocurrió un error al obtener los clientes.
                </p>
            </Shell>
        );
    }

    const activeClients = clients.filter((client) => client.isActive);  // Filtrando los clientes activos

    const formattedClients = activeClients.map((client) => ({
        ...client,
        id: client.id ?? "-", // Si no hay id convertir el null a un string vacio
        clientLocations: client.clientLocations?.map((location) => ({   // Dando el formato correcto a la dirección
            address: location.address || "-",
        })) || [],
        razonSocial: client.razonSocial ?? "-",  // Si no hay razon social, convertir el null a un string vacio
    }));

    return (
        <Shell>
            <HeaderPage title="Gestión de clientes" description="Gestiona los clientes de tu empresa" />
            <ClientsDataTable columns={columns} data={formattedClients} />
        </Shell>
    );
}

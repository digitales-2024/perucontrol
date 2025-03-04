import { backend, wrapper } from "@/types/backend";
import { CreateQuotation } from "./CreateQuotation";

export async function QuotationTableToolbarActions({
})

{
    // get all terms and conditions
    const [data, err] = await wrapper((auth) => backend.GET("/api/TermsAndConditions", auth));
    if (err)
    {
        console.error(`error ${err.message}`);
        throw err;
    }

    // get all clients
    const [clients, clientsError] = await wrapper((auth) => backend.GET("/api/Client", { ...auth }));

    if (clientsError)
    {
        console.error("Error getting all clients:", clientsError);
        return null;
    }

    // get all services
    const [services, servicesError] = await wrapper((auth) => backend.GET("/api/Service", { ...auth }));

    if (servicesError)
    {
        console.error("Error getting all clients:", servicesError);
        return null;
    }

    return (
        <div className="flex w-fit flex-wrap items-center gap-2">
            <CreateQuotation termsAndConditions={data} clients={clients} services={services} />
        </div>
    );
}

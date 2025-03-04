"use client";

import { components } from "@/types/api";
import { CreateQuotation } from "./CreateQuotation";

interface Props {
    terms: Array<components["schemas"]["TermsAndConditions"]>;
    clients: Array<components["schemas"]["ClientGetDTO"]>;
    services: Array<components["schemas"]["ServiceGetDTO"]>;
}

export function QuotationTableToolbarActions({
    terms,
    clients,
    services,
}: Props)

{
    return (
        <div className="flex w-fit flex-wrap items-center gap-2">
            <CreateQuotation termsAndConditions={terms} clients={clients} services={services} />
        </div>
    );
}

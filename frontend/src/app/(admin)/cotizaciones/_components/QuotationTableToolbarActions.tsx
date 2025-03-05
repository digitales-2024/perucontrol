"use client";

import { CreateQuotation } from "./CreateQuotation";

export function QuotationTableToolbarActions({})
{
    return (
        <div className="flex w-fit flex-wrap items-center gap-2">
            <CreateQuotation  />
        </div>
    );
}

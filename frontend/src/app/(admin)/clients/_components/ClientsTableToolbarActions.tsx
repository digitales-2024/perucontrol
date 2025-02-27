"use client";

import { CreateClient } from "./CreateClient";

export function ClientTableToolbarActions({
})
{
    return (
        <div className="flex w-fit flex-wrap items-center gap-2">
            <CreateClient />
        </div>
    );
}

"use client";

import { CreateProject } from "./CreateProject";

export function ProjectsTableToolbarActions({})
{
    return (
        <div className="flex w-fit flex-wrap items-center gap-2">
            <CreateProject  />
        </div>
    );
}

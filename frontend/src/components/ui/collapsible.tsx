"use client";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

function Collapsible({
    ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>)
{
    return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

function CollapsibleTrigger({
    ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>)
{
    return (
        <CollapsiblePrimitive.CollapsibleTrigger
            suppressHydrationWarning
            data-slot="collapsible-trigger"
            {...props}
        />
    );
}

function CollapsibleContent({
    ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>)
{
    return (
        <CollapsiblePrimitive.CollapsibleContent
            suppressHydrationWarning
            data-slot="collapsible-content"
            {...props}
        />
    );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };

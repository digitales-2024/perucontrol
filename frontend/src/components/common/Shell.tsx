import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const shellVariants = cva("grid items-center gap-8 pb-8 pt-6 px-1 md:p-8", {
    variants: {
        variant: {
            default: "container",
            sidebar: "",
            centered:
                "container flex h-dvh max-w-2xl flex-col justify-center py-16",
            markdown: "container max-w-3xl py-8 md:py-10 lg:py-10",
        },
    },
    defaultVariants: {
        variant: "sidebar",
    },
});

interface ShellProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof shellVariants> {
    as?: React.ElementType;
}

function Shell({
    ...props
}: ShellProps)
{
    return (
        { ...props }
    );
}

export { Shell, shellVariants };

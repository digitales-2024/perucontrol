import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-auto",
    {
        variants: {
            variant: {
                default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
                secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
                destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
                outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
                approved:
          "border-transparent bg-green-500 text-white [a&]:hover:bg-green-600 focus-visible:ring-green-300 dark:focus-visible:ring-green-700",
                deleted:
          "border-transparent bg-gray-500 text-white [a&]:hover:bg-gray-600 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-700",
                excel:
          "border-transparent bg-green-600 text-white [a&]:hover:bg-green-600 focus-visible:ring-green-300 dark:focus-visible:ring-green-700",
                pdf:
          "border-transparent bg-red-600 text-white [a&]:hover:bg-red-600 focus-visible:ring-red-300 dark:focus-visible:ring-red-700",
                word:
          "border-transparent bg-blue-600 text-white [a&]:hover:bg-blue-600 focus-visible:ring-blue-300 dark:focus-visible:ring-blue-700",
                ambient:
          "border-transparent bg-green-500 text-primary-foreground [a&]:hover:bg-green/90",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    },
);

function Badge({
    className,
    variant,
    asChild = false,
    ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean })
{
    const Comp = asChild ? Slot : "span";

    return (
        <Comp
            data-slot="badge"
            className={cn(badgeVariants({ variant }), className)}
            {...props}
        />
    );
}

export { Badge, badgeVariants };

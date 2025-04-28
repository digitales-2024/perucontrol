import { ReactNode } from "react";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface DocumentButtonProps {
	href: string;
	disabled: boolean;
	disabledTitle: string;
	className?: string;
	icon?: ReactNode;
	children: ReactNode;
}

export const DocumentButton = ({
    href,
    disabled,
    disabledTitle,
    className = "text-xs md:text-sm",
    icon = <Download />,
    children,
}: DocumentButtonProps) =>
{
    const buttonContent = (
        <>
            {icon}
            {children}
        </>
    );

    if (disabled)
    {
        return (
            <Button
                disabled
                className={`disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
                title={disabledTitle}
            >
                {buttonContent}
            </Button>
        );
    }

    return (
        <Link href={href}>
            <Button className={className}>
                {buttonContent}
            </Button>
        </Link>
    );
};


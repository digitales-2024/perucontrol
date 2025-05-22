import { Badge } from "../ui/badge";
import { SidebarTrigger } from "../ui/sidebar";

interface HeaderPageProps {
    title: string;
    description?: string;
    badgeContent?: string;
    breadcrumbs?: React.ReactNode;
}

export const HeaderPage = ({
    title,
    badgeContent,
    breadcrumbs,
}: HeaderPageProps) => (
    <>
        <h1 className="text-2xl md:text-2xl font-bold">
            <SidebarTrigger />
            {title}
        </h1>
        {badgeContent && (
            <div className="m-2 mt-5">
                <Badge
                    className="bg-emerald-100 capitalize text-emerald-700"
                    variant="secondary"
                >
                    {badgeContent}
                </Badge>
            </div>
        )}
        <div className="pl-8">
            {breadcrumbs}
        </div>
    </>
);

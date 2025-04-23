import { Badge } from "../ui/badge";
import { SidebarTrigger } from "../ui/sidebar";

interface HeaderPageProps {
    title: string;
    description?: string;
    badgeContent?: string;
}

export const HeaderPage = ({
    title,
    badgeContent,
}: HeaderPageProps) => (
    <>
        <h1 className="text-2xl md:text-2xl font-bold ml-2 mt-3">
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
    </>
);

import { Badge } from "../ui/badge";

interface TitleSecctionProps {
  text: string;
}

function TitleSecction({ text }: TitleSecctionProps)
{
    return (
        <h1 className="text-4xl font-bold">
            {text}
        </h1>
    );
}

interface HeaderPageProps {
  title: string;
  description?: string;
  badgeContent?: string;
}

export const HeaderPage = ({
    title,
    description,
    badgeContent,
}: HeaderPageProps) => (
    <div>
        <TitleSecction text={title} />
        {badgeContent && (
            <div className="m-2">
                <Badge
                    className="bg-emerald-100 capitalize text-emerald-700"
                    variant="secondary"
                >
                    {badgeContent}
                </Badge>
            </div>
        )}
        <span className="text-sm">
            {description}
        </span>
    </div>
);

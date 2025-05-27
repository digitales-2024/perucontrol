import { cn } from "@/lib/utils";
import { format, isSameDay } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

export default function CalendarBodyHeader({
    date,
    onlyDay = false,
}: {
    date: Date
    onlyDay?: boolean
})
{
    const isToday = isSameDay(date, new Date());
    const isMobile = useIsMobile();

    return (
        <div className="flex items-center bg-primary text-white justify-center gap-1 py-2 w-full sticky top-0 bg-background z-10 border-b">
            <span
                className={cn(
                    "text-xs font-medium capitalize",
                    isToday ? "underline text-bold" : "",
                )}
            >
                {date.toLocaleString("es-PE", { weekday: "short" })}
            </span>
            {!onlyDay && (
                <span
                    className={cn(
                        "text-xs font-medium text-white",
                        isToday ? "underline font-bold" : "",
                    )}
                >
                    {format(date, "dd")}
                </span>
            )}
        </div>
    );
}

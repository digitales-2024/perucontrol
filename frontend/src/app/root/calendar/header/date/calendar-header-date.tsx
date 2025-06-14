import { useCalendarContext } from "../../calendar-context";
import CalendarHeaderDateIcon from "./calendar-header-date-icon";
import CalendarHeaderDateChevrons from "./calendar-header-date-chevrons";
import CalendarHeaderDateBadge from "./calendar-header-date-badge";

export default function CalendarHeaderDate()
{
    const { date } = useCalendarContext();
    return (
        <div className="flex items-center gap-2">
            <CalendarHeaderDateIcon />
            <div>
                <div className="flex items-center gap-1">
                    <p className="text-lg font-semibold">
                        {date.toLocaleString("es-PE", { month: "long", day: "numeric" })}
                    </p>
                    <CalendarHeaderDateBadge />
                </div>
                <CalendarHeaderDateChevrons />
            </div>
        </div>
    );
}

import { format } from "date-fns";
import { useCalendarContext } from "../../calendar-context";

export default function CalendarHeaderDateIcon()
{
    const { calendarIconIsToday, date: calendarDate } = useCalendarContext();
    const date = calendarIconIsToday ? new Date() : calendarDate;
    return (
        <div className="flex size-14 flex-col items-start overflow-hidden rounded-lg border">
            <p className="flex h-6 w-full items-center justify-center bg-primary text-center text-xs font-semibold text-background uppercase">
                {dateToMonthStr(date)}
            </p>
            <p className="flex w-full items-center justify-center text-lg font-bold">
                {format(date, "dd")}
            </p>
        </div>
    );
}

function dateToMonthStr(date: Date)
{
    const months = [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic",
    ];
    return months[date.getMonth()];
}

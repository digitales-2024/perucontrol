"use client";

import { useEffect, useState } from "react";
import Calendar from "./calendar/calendar";
import { CalendarEvent, Mode } from "./calendar/calendar-types";

export default function CalendarDemo()
{
    const [events, setEvents] = useState<Array<CalendarEvent>>([]);
    const [mode, setMode] = useState<Mode>("mes");
    const [date, setDate] = useState<Date>(new Date());

    useEffect(() =>
    {
        console.log("MODE!", mode);
        console.log("DATE!", date);
    });

    return (
        <Calendar
            events={events}
            setEvents={setEvents}
            mode={mode}
            setMode={setMode}
            date={date}
            setDate={setDate}
        />
    );
}

function computeTimeRange(mode: Mode, date: Date): [Date, Date]
{
    if (mode === "mes")
    {
        const start = new Date(date);
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        end.setHours(23, 59, 59, 999);
        return [start, end];
    }
    else if (mode === "semana")
    {
        const start = new Date(date);
        // For Monday as first day:
        // getDay() gives 0 (Sunday) to 6 (Saturday)
        // We need to convert:
        // Monday (1) should be 0, Tuesday (2) should be 1, ... Sunday (0) should be 6
        const day = date.getDay();
        const offset = day === 0 ? 6 : day - 1;
        start.setDate(date.getDate() - offset);
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        return [start, end];
    }
}

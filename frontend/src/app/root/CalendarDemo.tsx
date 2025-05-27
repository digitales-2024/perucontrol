"use client";

import { useEffect, useState } from "react";
import Calendar from "./calendar/calendar";
import { CalendarEvent, Mode } from "./calendar/calendar-types";
import { GetAppointmentsByDate } from "./actions";
import { parseISO } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
// import { datesToStatus } from "../(admin)/projects/[id]/_components/AppointmentDetail";

export default function CalendarDemo()
{
    const [events, setEvents] = useState<Array<CalendarEvent>>([]);
    const isMobile = useIsMobile();
    
    // Auto-set mode based on screen size
    const [mode, setMode] = useState<Mode>("mes");
    const [date, setDate] = useState<Date>(new Date());

    // Auto-switch mode based on mobile state
    useEffect(() => {
        if (isMobile) {
            setMode("semana"); // Force week mode on mobile
        } else {
            setMode("mes"); // Default to month mode on desktop
        }
    }, [isMobile]);

    // Custom mode setter that respects mobile constraints
    const handleModeChange = (newMode: Mode) => {
        // On mobile, only allow week mode
        if (isMobile) {
            setMode("semana");
        } else {
            setMode(newMode);
        }
    };

    useEffect(() =>
    {
        (async() =>
        {
            const [startDate, endDate] = (computeTimeRange(mode, date));

            const [data, err] = await GetAppointmentsByDate(startDate, endDate);
            if (err !== null)
            {
                return;
            }

            setEvents(data.map((appointment) =>
            {
                // const status = datesToStatus(appointment.dueDate, appointment.actualDate ?? undefined);
                
                // Determine status based on appointment data until the import is available
                let status = "Pendiente";
                const today = new Date();
                const dueDate = new Date(appointment.dueDate);
                
                if (appointment.actualDate) {
                    const actualDate = new Date(appointment.actualDate);
                    if (actualDate <= dueDate) {
                        status = "Completo";
                    } else {
                        status = "Completo con retraso";
                    }
                } else if (dueDate < today) {
                    status = "Retrasado";
                }

                let color = "";
                let borderColor = "";
                let bgColor = "";
                if (status === "Completo")
                {
                    color = "text-green-400";
                    borderColor = "border-green-400";
                    bgColor = "bg-green-400/10";
                }
                else if (status === "Completo con retraso")
                {
                    color = "text-amber-600";
                    borderColor = "border-amber-400";
                    bgColor = "bg-amber-400/10";
                }
                else if (status === "Retrasado")
                {
                    color = "text-red-600";
                    borderColor = "border-red-600";
                    bgColor = "bg-red-400/10";
                }
                else if (status === "Pendiente")
                {
                    color = "text-blue-600";
                    borderColor = "border-blue-600";
                    bgColor = "bg-blue-400/10";
                }

                return ({
                    id: appointment.id,
                    projectId: appointment.project.id!,
                    title: `#${appointment.project.projectNumber} - ${appointment.client.name}`,
                    color,
                    borderColor,
                    bgColor,
                    start: parseISO(appointment.dueDate),
                    end: parseISO(appointment.dueDate),
                });
            }));
        })();
    }, [mode, date]);

    return (
        <Calendar
            events={events}
            setEvents={setEvents}
            mode={mode}
            setMode={handleModeChange}
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
    else
    {
        throw new Error("Invalid mode");
    }
}

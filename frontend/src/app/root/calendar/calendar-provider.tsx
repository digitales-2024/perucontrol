import { CalendarContext } from "./calendar-context";
import { CalendarEvent, Mode } from "./calendar-types";
import { useState } from "react";
import CalendarManageEventDialog from "./dialog/calendar-manage-event-dialog";

export default function CalendarProvider({
    events,
    setEvents,
    mode,
    setMode,
    date,
    setDate,
    calendarIconIsToday = true,
    children,
}: {
    events: Array<CalendarEvent>
    setEvents: (events: Array<CalendarEvent>) => void
    mode: Mode
    setMode: (mode: Mode) => void
    date: Date
    setDate: (date: Date) => void
    calendarIconIsToday: boolean
    children: React.ReactNode
})
{
    const [newEventDialogOpen, setNewEventDialogOpen] = useState(false);
    const [manageEventDialogOpen, setManageEventDialogOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

    return (
        <CalendarContext.Provider
            value={{
                events,
                setEvents,
                mode,
                setMode,
                date,
                setDate,
                calendarIconIsToday,
                newEventDialogOpen,
                setNewEventDialogOpen,
                manageEventDialogOpen,
                setManageEventDialogOpen,
                selectedEvent,
                setSelectedEvent,
            }}
        >
            <CalendarManageEventDialog />
            {children}
        </CalendarContext.Provider>
    );
}

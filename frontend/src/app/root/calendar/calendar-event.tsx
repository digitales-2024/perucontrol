"use client";

import { CalendarEvent as CalendarEventType } from "./calendar-types";
import { isSameDay, isSameMonth } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, MotionConfig, AnimatePresence } from "framer-motion";
import { useCalendarContext } from "./calendar-context";
import { redirect } from "next/navigation";

interface EventPosition {
    left: string
    width: string
    top: string
    height: string
}

function getOverlappingEvents(
    currentEvent: CalendarEventType,
    events: Array<CalendarEventType>,
): Array<CalendarEventType>
{
    return events.filter((event) =>
    {
        if (event.id === currentEvent.id) return false;
        return (
            currentEvent.start <= event.end &&
            currentEvent.end >= event.start &&
            isSameDay(currentEvent.start, event.start)
        );
    });
}

function calculateEventPosition(
    event: CalendarEventType,
    allEvents: Array<CalendarEventType>,
): EventPosition
{
    const overlappingEvents = getOverlappingEvents(event, allEvents);

    const group = [event, ...overlappingEvents].sort((a, b) => (a.id > b.id ? 1 : -1));
    const position = group.indexOf(event);
    const width = "100%";

    const topPosition = 128 * position;
    const height = 128;

    return {
        left: "0",
        width,
        top: `${topPosition}px`,
        height: `${height}px`,
    };
}

export default function CalendarEvent({
    event,
    month = false,
    className,
}: {
    event: CalendarEventType
    month?: boolean
    className?: string
})
{
    const { events, date } =
        useCalendarContext();
    const style = month ? {} : calculateEventPosition(event, events);

    // Generate a unique key that includes the current month to prevent animation conflicts
    const isEventInCurrentMonth = isSameMonth(event.start, date);
    const animationKey = `${event.id}-${isEventInCurrentMonth ? "current" : "adjacent"}`;

    return (
        <MotionConfig reducedMotion="user">
            <AnimatePresence mode="wait">
                <motion.div
                    className={cn(
                        `px-1 py-1 rounded-md truncate cursor-pointer transition-all duration-300 ${event.bgColor} border ${event.borderColor}`,
                        !month && "absolute",
                        className,
                    )}
                    style={style}
                    onClick={(e) =>
                    {
                        e.stopPropagation();

                        redirect(`/projects/${event.projectId}`);
                    }}
                    initial={{
                        opacity: 0,
                        y: -3,
                        scale: 0.98,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                    }}
                    exit={{
                        opacity: 0,
                        scale: 0.98,
                        transition: {
                            duration: 0.15,
                            ease: "easeOut",
                        },
                    }}
                    transition={{
                        duration: 0.2,
                        ease: [0.25, 0.1, 0.25, 1],
                        opacity: {
                            duration: 0.2,
                            ease: "linear",
                        },
                        layout: {
                            duration: 0.2,
                            ease: "easeOut",
                        },
                    }}
                    layoutId={`event-${animationKey}-${month ? "month" : "day"}`}
                >
                    <motion.div
                        className={cn(
                            `flex flex-col w-full ${event.color}`,
                            month && "flex-row items-center justify-between",
                        )}
                        layout="position"
                    >
                        <p className={cn("font-bold truncate", month && "text-xs")}>
                            {event.title}
                        </p>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </MotionConfig>
    );
}

import { AccordionContent, AccordionItem, AccordionTriggerAsChild } from "@/components/ui/accordion";
import { components } from "@/types/api";
import { parseISO } from "date-fns";
import { CheckIcon, ChevronDown, ClockArrowDown, Flag, Ellipsis } from "lucide-react";

type ProjectSummarySingle = components["schemas"]["ProjectSummarySingle"];
type ProjectAppointment = ProjectSummarySingle["appointments"][number]

export function AppointmentDetail({
    appointment,
    idx,
}: {
    appointment: ProjectAppointment,
    idx: number,
})
{
    const dueDate = parseISO(appointment.dueDate);
    const dueDateStr = dueDate.toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "America/Lima",
    });

    const deliveryDate: Date | null = (!!appointment.actualDate) ? parseISO(appointment.actualDate) : null;

    return (
        <AccordionItem value={appointment.id!}>
            <AccordionTriggerAsChild asChild>
                <button className="grid w-full grid-cols-[1.5rem_auto_2.5rem] items-center cursor-pointer">
                    {AppointmentIcon(appointment.dueDate, appointment.actualDate ?? undefined)}
                    <div className="flex items-center py-3 pl-1">
                        Fecha #
                        <b>
                            {idx + 1}
                        </b>
                        &nbsp;
                        -
                        &nbsp;
                        {dueDateStr}
                        <span className={"ml-2 inline-block h-2 w-2 rounded-full "} />
                    </div>
                    <ChevronDown className="transition-transform chevron" />
                </button>
            </AccordionTriggerAsChild>
            <AccordionContent>

                <div className="my-2 grid grid-cols-[2rem_auto] items-center gap-4">
                    <div className="text-center">
                        <Flag className={"inline-block"} />
                    </div>
                    <div>
                        <p className="text-xs text-zinc-700">
                            Fecha planificada
                        </p>
                        <p className="text-lg">
                            {dueDate.toLocaleString("es-PE", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                timeZone: "America/Lima",
                            })}
                        </p>
                    </div>
                </div>
                <div className="my-2 grid grid-cols-[2rem_auto] items-center gap-4">
                    <div className="text-center">
                        {AppointmentIcon(appointment.dueDate, appointment.actualDate ?? undefined)}
                    </div>
                    <div>
                        <p className="text-xs text-zinc-700">
                            Fecha real
                        </p>
                        <p className="text-lg">
                            {deliveryDate !== null ? (
                                <>
                                    {
                                        deliveryDate.toLocaleString("es-PE", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                            timeZone: "America/Lima",
                                        })
                                    }
                                </>
                            ) : (
                                <span>
                                    Pendiente
                                </span>
                            )}

                        </p>
                    </div>
                </div>

            </AccordionContent>
        </AccordionItem>
    );
}

function AppointmentIcon(dueDateStr: string, actualStr?: string)
{
    const status = datesToStatus(dueDateStr, actualStr);

    if (status === "Completo")
    {
        return (
            <span className="inline-block" title="Completo">
                <CheckIcon className="text-green-500" />
            </span>
        );
    }
    else if (status === "Completo con retraso")
    {
        return (
            <span className="inline-block" title="Completo con retraso">
                <CheckIcon className="text-amber-600" />
            </span>
        );
    }
    else if (status === "Pendiente")
    {
        return (
            <span className="inline-block" title="Pendiente">
                <Ellipsis />
            </span>
        );
    }
    else if (status === "Retrasado")
    {
        return (
            <span className="inline-block" title="Con retraso">
                <ClockArrowDown className="text-red-500" />
            </span>
        );
    }
}

type DateStatus = "Pendiente" | "Retrasado" | "Completo" | "Completo con retraso"
export function datesToStatus(dueDateStr: string, actualStr?: string): DateStatus
{
    const dueDate = parseISO(dueDateStr);
    const now = new Date();

    if (actualStr !== undefined)
    {
        const actual = parseISO(actualStr!);

        if (actual <= dueDate)
        {
            return "Completo";
        }
        else
        {
            return "Completo con retraso";
        }
    }
    else
    {
        if (dueDate < now)
        {
            return "Retrasado";
        }
        else
        {
            return "Pendiente";
        }
    }
}

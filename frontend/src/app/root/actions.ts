"use server";

import { components } from "@/types/api";
import { backend, FetchError, wrapper } from "@/types/backend";
import { err, ok, Result } from "@/utils/result";
import { formatRFC3339 } from "date-fns";

type Appointment = components["schemas"]["AppointmentGetDTO"];

export async function GetAppointmentsByDate(startDate: Date, endDate: Date)
    : Promise<Result<Array<Appointment>, FetchError>>
{
    const [data, error] = await wrapper((auth) => backend.GET("/api/Appointment", {
        ...auth,
        params: {
            query: {
                start: formatRFC3339(startDate),
                end: formatRFC3339(endDate),
            },
        },
    }));

    if (error !== null)
    {
        return err(error);
    }

    return ok(data);
}


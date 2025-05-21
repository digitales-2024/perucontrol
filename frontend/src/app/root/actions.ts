"use server";

import { components } from "@/types/api";
import { backend, FetchError, wrapper } from "@/types/backend";
import { err, ok, Result } from "@/utils/result";
import { formatRFC3339 } from "date-fns";
import { revalidatePath } from "next/cache";

type Appointment = components["schemas"]["AppointmentGetDTO"];
type StatsData = components["schemas"]["StatsGet"]

type UserUpdateDTO = {
    name: string;
    email: string;
    password?: string;
};

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

export async function UpdateUserProfile(data: UserUpdateDTO): Promise<Result<null, FetchError>>
{
    const [, error] = await wrapper((auth) => backend.PUT("/api/User", {
        ...auth,
        body: data,
    }));
    if (error !== null)
    {
        return err(error);
    }

    revalidatePath("/");

    return ok(null);
}

export async function LoadDashboardData(start: Date, end: Date): Promise<Result<StatsData, FetchError>>
{
    return await wrapper((auth) => backend.GET("/api/Stats", {
        ...auth,
        params: {
            query: {
                start: formatRFC3339(start),
                end: formatRFC3339(end),
            },
        },
    }));
}

import { Columns2, Grid3X3 } from "lucide-react";
import { Mode } from "./calendar-types";

export const calendarModeIconMap: Record<Mode, React.ReactNode> = {
    semana: <Columns2 />,
    mes: <Grid3X3 />,
};

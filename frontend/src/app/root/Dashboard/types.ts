
/** The type of names of services */
export type ServiceName =
    | "desratizacion"
    | "desinsectacion"
    | "fumigacion"
    | "desinfeccion"
    | "limpieza_tanque"

export function serviceLabelToServiceName(input: string): ServiceName
{
    switch (input)
    {
    case "Desratización":
        return "desratizacion";
    case "Desinsectación":
        return "desinsectacion";
    case "Fumigación":
        return "fumigacion";
    case "Desinfección":
        return "desinfeccion";
    case "Limpieza de tanque":
        return "limpieza_tanque";
    default:
        throw new Error(`Invalid service name: ${input}`);
    }
}

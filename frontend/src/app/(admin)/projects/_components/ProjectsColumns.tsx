"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Calendar1 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { components } from "@/types/api";
import { format } from "date-fns";

type ProjectSummary = components["schemas"]["ProjectSummary"]

export const columns: Array<ColumnDef<ProjectSummary>> = [
    {
        accessorKey: "createdAt",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-left w-full"
            >
                FECHA DE EMISIÓN
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;
            const formattedDate = row.original.createdAt
                ? format(new Date(row.original.createdAt), "yyyy-MM-dd")
                : "N/A";
            return (
                <span
                    className={`items-center flex justify-center uppercase text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}
                >
                    <Calendar1 className="mr-1" />
                    {formattedDate}
                </span>
            );
        },
    },
    {
        accessorKey: "orderNumber",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-left w-full"
            >
                # SERVICIO
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;
            return (
                <span
                    className={`items-center flex justify-center uppercase text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}
                >
                    {row.original.projectNumber}
                </span>
            );
        },
    },
    {
        accessorKey: "client",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-left w-full"
            >
                CLIENTE
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;
            return (
                <span
                    className={`items-center flex justify-center uppercase text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}
                >
                    {row.original.client?.name === "-" ? row.original.client.razonSocial : row.original.client?.name}
                </span>
            );
        },
    },
    {
        accessorKey: "area",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-left w-full"
            >
                ÁREA m2
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;
            return (
                <span
                    className={`items-center flex justify-center uppercase text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}
                >
                    {row.original.area}
                </span>
            );
        },
    },
    {
        accessorKey: "spacesCount",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-left w-full"
            >
                NRO. DE AMBIENTES
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;
            return (
                <span
                    className={`items-center flex justify-center uppercase text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}
                >
                    {row.original.spacesCount}
                </span>
            );
        },
    },
    {
        accessorKey: "price",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-left w-full"
            >
                PRECIO
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original?.isActive;
            return (
                <span className={`flex justify-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""
                }`}
                >
                    {row.original?.price.toLocaleString("es-PE", {
                        style: "currency",
                        currency: "PEN",
                    })}
                </span>
            );
        },
    },
    {
        accessorKey: "state",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-left w-full"
            >
                ESTADO
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;

            return (
                <span
                    className={`items-center flex justify-center uppercase text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}
                >
                    {row.original?.status === "Pending" ? (
                        <Badge variant={!isActive ? "deleted" : "default"}>
                            Pendiente
                        </Badge>
                    ) : row.original?.status === "Completed" ? (
                        <Badge variant={!isActive ? "deleted" : "approved"}>
                            Aprobado
                        </Badge>
                    ) : (
                        <Badge variant={!isActive ? "deleted" : "destructive"}>
                            Rechazado
                        </Badge>
                    )}
                </span>
            );
        },
    },
    {
        accessorKey: "address",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="p-0 text-black font-bold hover:bg-transparent text-xs md:text-sm whitespace-normal text-left w-full"
            >
                DIRECCIÓN
            </Button>
        ),
        cell: ({ row }) =>
        {
            const isActive = row.original.isActive;
            return (
                <span
                    className={`items-center flex justify-center uppercase text-center text-xs md:text-sm ${!isActive ? "line-through text-red-500" : ""}`}
                >
                    {row.original.address}
                </span>
            );
        },
    },
    // {
    //     id: "acciones",
    //     header: "Acciones",
    //     cell: function Cell({ row })
    //     {
    //         const isActive = row.original?.isActive;
    //         const [showDeleteProject, setShowDeleteProject] = useState(false);

    //         const projectId = row.original.id;
    //         return (
    //             <div onClick={(e) => e.stopPropagation()}>
    //                 <div>
    //                     {/* Eliminar un proyecto */}
    //                     <DeleteProject
    //                         open={showDeleteProject}
    //                         onOpenChange={setShowDeleteProject}
    //                         project={row?.original}
    //                         showTrigger={false}
    //                     />
    //                 </div>
    //                 <DropdownMenu>
    //                     <DropdownMenuTrigger asChild>
    //                         <Button aria-label="Open menu" variant="ghost" className="flex size-8 p-0 data-[state=open]:bg-muted">
    //                             <Ellipsis className="size-4" aria-hidden="true" />
    //                         </Button>
    //                     </DropdownMenuTrigger>
    //                     <DropdownMenuContent align="end">
    //                         <DropdownMenuLabel>
    //                             Acciones
    //                         </DropdownMenuLabel>
    //                         <DropdownMenuSeparator />
    //                         <Link href={`/projects/${projectId}`}>
    //                             <DropdownMenuItem disabled={!isActive}>
    //                                 Ver Detalles
    //                             </DropdownMenuItem>
    //                         </Link>
    //                         <DropdownMenuSeparator />
    //                         <Link href={`/projects/${projectId}/update/`}>
    //                             <DropdownMenuItem disabled={!isActive}>
    //                                 Editar
    //                             </DropdownMenuItem>
    //                         </Link>
    //                         <DropdownMenuItem onSelect={() => setShowDeleteProject(true)} disabled={!isActive}>
    //                             Eliminar
    //                         </DropdownMenuItem>
    //                     </DropdownMenuContent>
    //                 </DropdownMenu>
    //             </div>
    //         );
    //     },
    // },
];


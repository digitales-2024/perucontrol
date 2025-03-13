"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { AutoComplete } from "@/components/ui/autocomplete";
import { components } from "@/types/api";
import { useMemo } from "react";
import { CalendarIcon } from "lucide-react";
import DatePicker from "@/components/ui/date-time-picker";
import { format, parseISO } from "date-fns";

const createSchema = z.object({
    projectId: z.string({ message: "Selecciona un servicio" }).nonempty({ message: "Selecciona un servicio" }),
    creationDate: z.string().datetime({ message: "Fecha invalida" }),
    expirationDate: z.string().datetime({ message: "Fecha invalida" }),
});
type CreateSchema = z.infer<typeof createSchema>;

type Project = components["schemas"]["ProjectSummary"];

export function CertificateCreate({
    projects,
}: {
    projects: Array<Project>
})
{
    const form = useForm<CreateSchema>({
        resolver: zodResolver(createSchema),
        defaultValues: {
            projectId: "",
            creationDate: "",
            expirationDate: "",
        },
    });

    // 2. Define a submit handler.
    const onSubmit = async(values: CreateSchema) =>
    {
        // Do something with the form values.
        console.log(values);
    };

    const projectOptions = useMemo(() => projects.map((project) => ({
        label: `${project!.client!.name} - ${project.id!.substring(0, 6)}`,
        value: project.id!,
    })), [projects]);

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    {/* Cliente */}
                    <FormField
                        control={form.control}
                        name="projectId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-base">
                                    Servicio vinculado
                                </FormLabel>
                                <FormControl>
                                    <AutoComplete
                                        options={projectOptions}
                                        placeholder="Selecciona un servicio"
                                        emptyMessage="No se encontraron servicios"
                                        value={
                                            projectOptions.find((option) => option.value === field.value) ?? undefined
                                        }
                                        onValueChange={(option) =>
                                        {
                                            field.onChange(option?.value ?? "");
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="creationDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2 text-base font-medium">
                                    <CalendarIcon className="h-4 w-4 text-blue-500" />
                                    Fecha de Emisión
                                </FormLabel>
                                <FormDescription>
                                    Seleccione la fecha de emisión del certificado
                                </FormDescription>
                                <FormControl>
                                    <DatePicker
                                        value={field.value ? parseISO(field.value) : undefined}
                                        onChange={(date) =>
                                        {
                                            if (date)
                                            {
                                                const formattedDate = format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'");
                                                field.onChange(formattedDate);
                                            }
                                            else
                                            {
                                                field.onChange("");
                                            }
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="expirationDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2 text-base font-medium">
                                    <CalendarIcon className="h-4 w-4 text-blue-500" />
                                    Fecha de Expiración
                                </FormLabel>
                                <FormDescription>
                                    Seleccione la fecha en la que el certificado expira
                                </FormDescription>
                                <FormControl>
                                    <DatePicker
                                        value={field.value ? parseISO(field.value) : undefined}
                                        onChange={(date) =>
                                        {
                                            if (date)
                                            {
                                                const formattedDate = format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'");
                                                field.onChange(formattedDate);
                                            }
                                            else
                                            {
                                                field.onChange("");
                                            }
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit">
                        Submit
                    </Button>
                </form>
            </Form>
        </div>
    );
}

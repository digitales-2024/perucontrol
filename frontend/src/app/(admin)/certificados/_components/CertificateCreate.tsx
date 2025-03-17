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
import { toastWrapper } from "@/types/toasts";
import { CreateCertificate, DownloadCertificate } from "../actions";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const createSchema = z.object({
    projectId: z.string({ message: "Selecciona un servicio" }).nonempty({ message: "Selecciona un servicio" }),
    treatedArea: z.string().min(1, { message: "El área tratada es requerida" }),
    creationDate: z.string().datetime({ message: "Fecha invalida" }),
    expirationDate: z.string().datetime({ message: "Fecha invalida" }),
    elevatedTankCleaning: z.boolean(),
    tankCleaning: z.boolean(),
});
export type CreateSchema = z.infer<typeof createSchema>;

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
            treatedArea: "",
            creationDate: "",
            expirationDate: "",
        },
    });

    const onSubmit = async(values: CreateSchema) =>
    {
        // Create certificate
        const [certId, err] = await toastWrapper(CreateCertificate(values), {
            loading: "Creando certificado...",
            success: "Certificado creado",
        });
        if (err !== null)
        {
            return;
        }

        // Download certificate
        const [certBlob, certErr] = await toastWrapper(DownloadCertificate(certId), {
            loading: "Descargando certificado...",
            success: "Certificado descargado",
        });
        if (certErr !== null)
        {
            return;
        }

        // Save certificate
        const url = URL.createObjectURL(certBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "certificado.docx";
        a.click();
        URL.revokeObjectURL(url);
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
                        name="treatedArea"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Área tratada
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="Área tratada" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex gap-2">
                        <FormLabel className="text-base mt-1">
                            Limpieza y desinfección de tanques elevados y cisternas de agua.
                        </FormLabel>
                        <FormField
                            control={form.control}
                            name="elevatedTankCleaning"
                            render={({ field }) => (
                                <FormItem className="flex py-2">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex gap-2">
                        <FormLabel className="text-base mt-1">
                            Limpieza y desinfección de tanques cisternas de agua potable.
                        </FormLabel>
                        <FormField
                            control={form.control}
                            name="tankCleaning"
                            render={({ field }) => (
                                <FormItem className="flex py-2">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

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

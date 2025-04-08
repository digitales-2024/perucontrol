"use client";

import DatePicker from "@/components/ui/date-time-picker";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bug, BugOff, BugPlay, CalendarClock, CalendarIcon, CircleUser, ClipboardList, Download, Droplets, FileDigit, Hash, LandPlot, LightbulbIcon, ListCheck, MilkOff, MousePointer2, Rat, Save, SprayCan, SprayCanIcon, Users, X } from "lucide-react";
import { parseISO } from "date-fns";
import { useForm } from "react-hook-form";
import { downloadProjectSchema, type DownloadProjectSchema } from "../schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toastWrapper } from "@/types/toasts";
import { GenerateExcel, GeneratePDF, GetProjectOperationSheet, SaveProjectOperationSheetData } from "../actions";
import { useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { components } from "@/types/api";
import { useRouter } from "next/navigation";

type ProjectSummarySingle = components["schemas"]["ProjectSummarySingle"];
type ProjectAppointment = ProjectSummarySingle["appointments"][number]

const infestationLevels = [
    { id: "High", label: "Alto" },
    { id: "Moderate", label: "Moderado" },
    { id: "Low", label: "Bajo" },
    { id: "Negligible", label: "Insignificante" },
];

const rodentConsumptionLevels = [
    { id: "Partial", label: "Parcial" },
    { id: "Total", label: "Total" },
    { id: "Deteriorated", label: "Deteriorado" },
    { id: "NoConsumption", label: "Sin Consumo" },
];

export function DownloadProjectForm({
    onOpenChange,
    project,
    client,
    appointment,
}: {
    onOpenChange: (v: boolean) => void,
    project: components["schemas"]["ProjectSummarySingle"],
    client: components["schemas"]["Client"],
    appointment: ProjectAppointment,
})
{
    const router = useRouter();
    const serviceNames = project.services.map((service) => service.name);

    const form = useForm<DownloadProjectSchema>({
        resolver: zodResolver(downloadProjectSchema),
        defaultValues: {
            projectAppointmentId: project.id,
            operationDate: appointment.actualDate!,
            enterTime: "",
            leaveTime: "",
            razonSocial: client.razonSocial ?? client.name,
            address: project.address,
            businessType: client.businessType ?? "",
            treatedAreas: "",
            service: serviceNames,
            certificateNumber: "",
            insects: "",
            rodents: "",
            rodentConsumption: "Partial",
            otherPlagues: "",
            insecticide: "",
            insecticide2: "",
            rodenticide: "",
            desinfectant: "",
            otherProducts: "",
            insecticideAmount: "",
            insecticideAmount2: "",
            rodenticideAmount: "",
            desinfectantAmount: "",
            otherProductsAmount: "",
            staff1: "",
            staff2: "",
            staff3: "",
            staff4: "",
            aspersionManual: false,
            aspersionMotor: false,
            nebulizacionFrio: false,
            nebulizacionCaliente: false,
            colocacionCebosCebaderos: "",
            numeroCeboTotal: "",
            numeroCeboRepuestos: "",
            nroPlanchasPegantes: "",
            nroJaulasTomahawk: "",
            degreeInsectInfectivity: "Moderate",
            degreeRodentInfectivity: "Moderate",
            observations: "",
            recommendations: "",
        },
    });

    const onSubmit = async(input: DownloadProjectSchema) =>
    {
        saveData(input);
    };

    const saveData = async(body: DownloadProjectSchema) =>
    {
        const [, saveError] = await toastWrapper(
            SaveProjectOperationSheetData(project.id!, body),
            {
                loading: "Guardando datos...",
                success: "Datos guardados correctamente",
                error: (e) => `Error al guardar los datos: ${e.message}`,
            },
        );

        if (saveError)
        {
            console.error("Error al guardar los datos:", saveError);
            throw new Error("Error al guardar los datos");
        }
    };

    const downloadExcel = async() =>
    {
        console.log(appointment);
        // Genera el Excel
        const [blob, err] = await toastWrapper(GenerateExcel(appointment.id!), {
            loading: "Generando archivo",
            success: "Excel generado",
            error: (e) => `Error al generar el Excel: ${e.message}`,
        });

        if (err)
        {
            console.error("Error al generar el Excel:", err);
            return;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "servicio.ods";
        a.click();
        URL.revokeObjectURL(url);
        onOpenChange(false);
    };

    const downloadPDF = async() =>
    {
        const [blob, err] = await toastWrapper(GeneratePDF(appointment.id!), {
            loading: "Generando archivo",
            success: "Excel generado",
            error: (e) => `Error al generar el Excel: ${e.message}`,
        });

        if (err)
        {
            console.error("Error al generar el Excel:", err);
            return;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ficha_operaciones_${appointment.id!.substring(0, 4)}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        onOpenChange(false);
    };

    const handleSubmit = async(input: components["schemas"]["ProjectOperationSheetCreateDTO"]) =>
    {
        const [result, error] = await toastWrapper(
            SaveProjectOperationSheetData(project.id!, input), // Cambia a `true` si es una actualización
            {
                loading: "Guardando datos...",
                success: "Datos guardados correctamente",
                error: (e) => `Error al guardar los datos: ${e.message}`,
            },
        );

        if (error)
        {
            console.error("Error al guardar los datos:", error);
            return;
        }

        console.log("Datos guardados exitosamente:", result);
    };

    const handleCancel = async() =>
    {
        onOpenChange(false);
        router.back();
    };

    useEffect(() =>
    {
        const loadOperationSheet = async() =>
        {
            const [data, error] = await GetProjectOperationSheet(project.id!);

            if (error)
            {
                console.error("Error cargando la ficha operativa:", error);
                return;
            }

            if (!data)
            {
                console.warn("No se encontró una ficha operativa");
                return;
            }

            // Obtener los valores actuales del formulario (que incluyen los datos del proyecto)
            const currentValues = form.getValues();

            // Fusionar datos: si el dato de la ficha operativa es null/undefined, mantener el del proyecto
            const mergedData = {
                ...currentValues, // Datos actuales (proyecto)
                ...data, // Datos de la ficha operativa
                rodentConsumption: data.rodentConsumption ?? undefined, // Convertir null a undefined
                operationDate: appointment.actualDate
                    ? new Date(appointment.actualDate).toISOString()
                    : data.operationDate
                        ? new Date(data.operationDate).toISOString()
                        : currentValues.operationDate,
                degreeInsectInfectivity: data.degreeInsectInfectivity ?? undefined, // Convertir null a undefined
                degreeRodentInfectivity: data.degreeRodentInfectivity ?? undefined, // Convertir null a undefined
            };

            // Establecer los valores en el formulario sin perder los del proyecto
            form.reset(mergedData);
        };

        loadOperationSheet();
    }, [project.id, form, appointment.actualDate]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto">
                <Tabs defaultValue="general" className="w-full">
                    <div className="px-6">
                        <TabsList className="w-full h-auto bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 p-1.5 rounded-xl flex flex-wrap gap-1 border border-blue-200 dark:border-blue-800">
                            <TabsTrigger value="general" className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm rounded-lg transition-all duration-200">
                                <ClipboardList className="h-4 w-4 mr-2" />
                                Información General
                            </TabsTrigger>
                            <TabsTrigger value="plagas" className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm rounded-lg transition-all duration-200">
                                <Bug className="h-4 w-4 mr-2" />
                                Plagas y Métodos
                            </TabsTrigger>
                            <TabsTrigger value="metodos" className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm rounded-lg transition-all duration-200">
                                <SprayCan className="h-4 w-4 mr-2" />
                                Productos y Grados
                            </TabsTrigger>
                            <TabsTrigger value="personal" className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm rounded-lg transition-all duration-200">
                                <Users className="h-4 w-4 mr-2" />
                                Personal
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="mt-4 pb-20">
                        <Form {...form}>
                            <form id="projectForm" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-4">
                                <TabsContent value="general" className="mt-0">
                                    <Card className="border border-blue-100 dark:border-blue-900 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                                        <CardHeader className="py-3">
                                            <CardTitle className="text-md font-medium">
                                                Información General
                                            </CardTitle>
                                        </CardHeader>
                                        <Separator />
                                        <CardContent className="pt-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="operationDate"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2 font-medium">
                                                                <CalendarIcon className="h-4 w-4 text-blue-500" />
                                                                Fecha del Proyecto
                                                            </FormLabel>
                                                            <FormControl>
                                                                <DatePicker
                                                                    value={field.value ? parseISO(field.value) : undefined}
                                                                    onChange={(date) =>
                                                                    {
                                                                        if (date)
                                                                        {
                                                                            const utcDate = new Date(Date.UTC(
                                                                                date.getFullYear(),
                                                                                date.getMonth(),
                                                                                date.getDate(),
                                                                            ));
                                                                            field.onChange(utcDate.toISOString());
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
                                                <div className="grid grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="enterTime"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="flex items-center gap-2 font-medium">
                                                                    <CalendarClock className="h-4 w-4 text-blue-500" />
                                                                    Hora de Ingreso
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="09:30" {...field} className="border-gray-300" />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="leaveTime"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="flex items-center gap-2 font-medium">
                                                                    <CalendarClock className="h-4 w-4 text-blue-500" />
                                                                    Hora de Salida
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="15:30" {...field} className="border-gray-300" />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border shadow-sm mt-6">
                                        <CardHeader className="py-3">
                                            <CardTitle className="text-md font-medium">
                                                Detalles del Servicio
                                            </CardTitle>
                                        </CardHeader>
                                        <Separator />
                                        <CardContent className="pt-4">
                                            <div className="flex flex-col gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="treatedAreas"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2 font-medium">
                                                                <LandPlot className="h-4 w-4 text-blue-500" />
                                                                Áreas Tratadas
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Áreas Tratadas" {...field} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="certificateNumber"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2 font-medium">
                                                                <FileDigit className="h-4 w-4 text-blue-500" />
                                                                N° Certificado
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Numero de certificado" {...field} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="service"
                                                    render={() => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2 font-medium mb-3">
                                                                <ListCheck className="h-4 w-4 text-blue-500" />
                                                                Servicios Realizados
                                                            </FormLabel>
                                                            <div className="space-y-2">
                                                                {project.services?.map((service) => (
                                                                    <FormItem
                                                                        key={service.id}
                                                                        className="flex flex-row items-start space-x-3 space-y-0"
                                                                    >
                                                                        <FormLabel className="text-sm font-normal">
                                                                            {"- "}
                                                                            {service.name}
                                                                        </FormLabel>
                                                                    </FormItem>
                                                                ))}
                                                            </div>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                </TabsContent>

                                <TabsContent value="plagas" className="mt-0">
                                    <Card className="border shadow-sm">
                                        <CardHeader className="py-3">
                                            <CardTitle className="text-md font-medium">
                                                Plagas Identificadas
                                            </CardTitle>
                                        </CardHeader>
                                        <Separator />
                                        <CardContent className="pt-4">
                                            <div className="space-y-4">
                                                <FormLabel className="flex items-center gap-2 font-medium">
                                                    <Bug className="h-4 w-4 text-blue-500" />
                                                    Insectos
                                                </FormLabel>
                                                <FormField
                                                    control={form.control}
                                                    name="insects"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input placeholder="Insectos" {...field} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormLabel className="flex items-center gap-2 font-medium">
                                                    <Rat className="h-4 w-4 text-blue-500" />
                                                    Roedores
                                                </FormLabel>
                                                <FormField
                                                    control={form.control}
                                                    name="rodents"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input placeholder="Roedores" {...field} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormLabel className="flex items-center gap-2 font-medium">
                                                    <MilkOff className="h-4 w-4 text-blue-500" />
                                                    Consumo de roedores
                                                </FormLabel>
                                                <div className="space-y-2">
                                                    {rodentConsumptionLevels.map((level) => (
                                                        <FormField
                                                            key={level.id}
                                                            control={form.control}
                                                            name="rodentConsumption"
                                                            render={({ field }) => (
                                                                <FormItem className="flex items-start space-x-3 space-y-0">
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={field.value === level.id}
                                                                            onCheckedChange={(checked) => (checked ? field.onChange(level.id) : field.onChange(undefined))
                                                                            }
                                                                        />
                                                                    </FormControl>
                                                                    <FormLabel className="text-sm font-normal">
                                                                        {level.label}
                                                                    </FormLabel>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    ))}
                                                </div>

                                                <FormLabel className="flex items-center gap-2 font-medium">
                                                    <BugPlay className="h-4 w-4 text-blue-500" />
                                                    Otras Plagas
                                                </FormLabel>
                                                <FormField
                                                    control={form.control}
                                                    name="otherPlagues"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input placeholder="Otras plagas" {...field} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border shadow-sm mt-6">
                                        <CardHeader className="py-3">
                                            <CardTitle className="text-md font-medium">
                                                Métodos Utilizados
                                            </CardTitle>
                                        </CardHeader>
                                        <Separator />
                                        <CardContent className="pt-4">
                                            <div className="space-y-6">
                                                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-background">
                                                    <div className="grid grid-cols-3 gap-4">
                                                        {/* Columna de categorías */}
                                                        <div className="space-y-8">
                                                            <div className="pt-1">
                                                                <h3 className="text-sm font-semibold flex items-center">
                                                                    <SprayCanIcon className="h-4 w-4 text-blue-500 mr-2" />
                                                                    Aspersión
                                                                </h3>
                                                            </div>
                                                            <div className="pt-1">
                                                                <h3 className="text-sm font-semibold flex items-center">
                                                                    <Droplets className="h-4 w-4 text-blue-500 mr-2" />
                                                                    Nebulización
                                                                </h3>
                                                            </div>
                                                            <div className="pt-1">
                                                                <h3 className="text-sm font-semibold flex items-center">
                                                                    <MousePointer2 className="h-4 w-4 text-blue-500 mr-2" />
                                                                    Colocación de Cebos
                                                                </h3>
                                                            </div>
                                                            <div className="pt-1">
                                                                <h3 className="text-sm font-semibold flex items-center">
                                                                    <Hash className="h-4 w-4 text-blue-500 mr-2" />
                                                                    N° Cebos Total
                                                                </h3>
                                                            </div>
                                                            <div className="pt-1">
                                                                <h3 className="text-sm font-semibold flex items-center">
                                                                    <Hash className="h-4 w-4 text-blue-500 mr-2" />
                                                                    N° Cebos Repuestos
                                                                </h3>
                                                            </div>
                                                            <div className="pt-1">
                                                                <h3 className="text-sm font-semibold flex items-center">
                                                                    <MousePointer2 className="h-4 w-4 text-blue-500 mr-2" />
                                                                    Colocación de Planchas Pegantes
                                                                </h3>
                                                            </div>
                                                            <div className="pt-1">
                                                                <h3 className="text-sm font-semibold flex items-center">
                                                                    <MousePointer2 className="h-4 w-4 text-blue-500 mr-2" />
                                                                    Colocación de Jaulas Tomahawk
                                                                </h3>
                                                            </div>
                                                        </div>

                                                        {/* Columna 1 */}
                                                        <div className="space-y-8">
                                                            <FormField
                                                                control={form.control}
                                                                name="aspersionManual"
                                                                render={({ field }) => (
                                                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                                        <FormControl>
                                                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                                        </FormControl>
                                                                        <FormLabel className="font-normal">
                                                                            Manual
                                                                        </FormLabel>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={form.control}
                                                                name="nebulizacionFrio"
                                                                render={({ field }) => (
                                                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                                        <FormControl>
                                                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                                        </FormControl>
                                                                        <div className="flex items-center">
                                                                            <FormLabel className="font-normal">
                                                                                Frío
                                                                            </FormLabel>
                                                                        </div>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={form.control}
                                                                name="colocacionCebosCebaderos"
                                                                render={({ field }) => (
                                                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                                        <FormControl>
                                                                            <Input
                                                                                placeholder="Colocación de cebos cebaderos" {...field}
                                                                            />
                                                                        </FormControl>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={form.control}
                                                                name="numeroCeboTotal"
                                                                render={({ field }) => (
                                                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                                        <FormControl>
                                                                            <Input
                                                                                placeholder="N° Cebos Total"
                                                                                {...field}
                                                                                onChange={(e) => field.onChange(e.target.value)}
                                                                            />
                                                                        </FormControl>
                                                                    </FormItem>
                                                                )}
                                                            />

                                                            <FormField
                                                                control={form.control}
                                                                name="numeroCeboRepuestos"
                                                                render={({ field }) => (
                                                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                                        <FormControl>
                                                                            <Input
                                                                                placeholder="N° Cebos Repuestos"
                                                                                {...field}
                                                                                onChange={(e) => field.onChange(e.target.value)}
                                                                            />
                                                                        </FormControl>
                                                                    </FormItem>
                                                                )}
                                                            />

                                                            <FormField
                                                                control={form.control}
                                                                name="nroPlanchasPegantes"
                                                                render={({ field }) => (
                                                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                                        <FormControl>
                                                                            <Input
                                                                                placeholder="N° Planchas Pegantes"
                                                                                {...field}
                                                                                onChange={(e) => field.onChange(e.target.value)}
                                                                            />
                                                                        </FormControl>
                                                                    </FormItem>
                                                                )}
                                                            />

                                                            <FormField
                                                                control={form.control}
                                                                name="nroJaulasTomahawk"
                                                                render={({ field }) => (
                                                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                                        <FormControl>
                                                                            <Input
                                                                                placeholder="N° Jaulas Tomahawk"
                                                                                {...field}
                                                                                onChange={(e) => field.onChange(e.target.value)}
                                                                            />
                                                                        </FormControl>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </div>

                                                        {/* Columna 2 */}
                                                        <div className="space-y-8">
                                                            <FormField
                                                                control={form.control}
                                                                name="aspersionMotor"
                                                                render={({ field }) => (
                                                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                                        <FormControl>
                                                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                                        </FormControl>
                                                                        <FormLabel className="font-normal">
                                                                            Motor
                                                                        </FormLabel>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={form.control}
                                                                name="nebulizacionCaliente"
                                                                render={({ field }) => (
                                                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                                        <FormControl>
                                                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                                        </FormControl>
                                                                        <div className="flex items-center">
                                                                            <FormLabel className="font-normal">
                                                                                Caliente
                                                                            </FormLabel>
                                                                        </div>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <div className="invisible">
                                                                <span>
                                                                    Espacio
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="personal" className="mt-0">
                                    <Card className="border shadow-sm mt-6">
                                        <CardHeader className="py-3">
                                            <CardTitle className="text-md font-medium">
                                                Personal Asignado
                                            </CardTitle>
                                        </CardHeader>
                                        <Separator />
                                        <CardContent className="pt-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="staff1"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2 font-medium">
                                                                <CircleUser className="h-4 w-4 text-blue-500" />
                                                                Personal 1
                                                            </FormLabel>
                                                            <FormDescription>
                                                                Nombre del técnico principal
                                                            </FormDescription>
                                                            <FormControl>
                                                                <Input placeholder="Nombre completo" {...field} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="staff2"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2 font-medium">
                                                                <CircleUser className="h-4 w-4 text-blue-500" />
                                                                Personal 2
                                                            </FormLabel>
                                                            <FormDescription>
                                                                Nombre del técnico asistente
                                                            </FormDescription>
                                                            <FormControl>
                                                                <Input placeholder="Nombre completo" {...field} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="staff3"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2 font-medium">
                                                                <CircleUser className="h-4 w-4 text-blue-500" />
                                                                Personal 3
                                                            </FormLabel>
                                                            <FormDescription>
                                                                Nombre del personal adicional
                                                            </FormDescription>
                                                            <FormControl>
                                                                <Input placeholder="Nombre completo" {...field} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="staff4"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2 font-medium">
                                                                <CircleUser className="h-4 w-4 text-blue-500" />
                                                                Personal 4
                                                            </FormLabel>
                                                            <FormDescription>
                                                                Nombre del personal adicional
                                                            </FormDescription>
                                                            <FormControl>
                                                                <Input placeholder="Nombre completo" {...field} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border shadow-sm mt-6">
                                        <CardHeader className="py-3">
                                            <CardTitle className="text-md font-medium">
                                                Orden, Limpieza, Infraestructura y Elementos Innecesarios
                                            </CardTitle>
                                        </CardHeader>
                                        <Separator />
                                        <CardContent className="pt-4">
                                            <div className="space-y-6">
                                                <FormField
                                                    control={form.control}
                                                    name="observations"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2 font-medium">
                                                                <ClipboardList className="h-4 w-4 text-blue-500" />
                                                                Observaciones
                                                            </FormLabel>
                                                            <FormDescription>
                                                                Registre las observaciones sobre el estado de orden, limpieza e infraestructura
                                                            </FormDescription>
                                                            <FormControl>
                                                                <Textarea
                                                                    placeholder="Ingrese sus observaciones aquí..."
                                                                    className="min-h-[120px] resize-y"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="recommendations"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2 font-medium">
                                                                <LightbulbIcon className="h-4 w-4 text-blue-500" />
                                                                Recomendaciones
                                                            </FormLabel>
                                                            <FormDescription>
                                                                Registre las recomendaciones para mejorar las condiciones
                                                            </FormDescription>
                                                            <FormControl>
                                                                <Textarea
                                                                    placeholder="Ingrese sus recomendaciones aquí..."
                                                                    className="min-h-[120px] resize-y"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="metodos" className="mt-0 space-y-4">
                                    <Card className="border shadow-sm mt-6">
                                        <CardHeader className="py-3">
                                            <CardTitle className="text-md font-medium">
                                                Productos Utilizados
                                            </CardTitle>
                                        </CardHeader>
                                        <Separator />
                                        <CardContent className="pt-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="insecticide"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2 font-medium">
                                                                <BugOff className="h-4 w-4 text-blue-500" />
                                                                Insecticida
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Nombre del insecticida" {...field} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="insecticideAmount"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2 font-medium">
                                                                <Hash className="h-4 w-4 text-blue-500" />
                                                                Cantidad de Insecticida
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="Cantidad de Insecticida"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="insecticide2"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2 font-medium">
                                                                <BugOff className="h-4 w-4 text-blue-500" />
                                                                Insecticida 2
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Nombre del insecticida 2" {...field} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="insecticideAmount2"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2 font-medium">
                                                                <Hash className="h-4 w-4 text-blue-500" />
                                                                Cantidad de Insecticida 2
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="Cantidad de Insecticida 2"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="rodenticide"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2 font-medium">
                                                                <SprayCan className="h-4 w-4 text-blue-500" />
                                                                Rodenticida
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Nombre del rodenticida" {...field} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="insecticideAmount2"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2 font-medium">
                                                                <Hash className="h-4 w-4 text-blue-500" />
                                                                Cantidad de Insecticida 2
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="Cantidad de Insecticida 2"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="desinfectant"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2 font-medium">
                                                                <SprayCan className="h-4 w-4 text-blue-500" />
                                                                Desinfectante
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Nombre del desinfectante" {...field} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="desinfectantAmount"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2 font-medium">
                                                                <Hash className="h-4 w-4 text-blue-500" />
                                                                Cantidad de Desinfectante
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="Cantidad de Desinfectante"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="otherProducts"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2 font-medium">
                                                                <BugPlay className="h-4 w-4 text-blue-500" />
                                                                Otros Productos
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Otros productos utilizados" {...field} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="otherProductsAmount"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2 font-medium">
                                                                <Hash className="h-4 w-4 text-blue-500" />
                                                                Cantidad de Otros Productos
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="Cantidad de Otros Productos"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border shadow-sm">
                                        <CardHeader className="py-3">
                                            <CardTitle className="text-md font-medium">
                                                Grados de Infestación
                                            </CardTitle>
                                        </CardHeader>
                                        <Separator />
                                        <CardContent className="pt-4">
                                            <div className="space-y-6">
                                                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-background">
                                                    {/* Infestación de insectos y roedores en filas */}
                                                    <div className="space-y-4">
                                                        {/* Infestación de Insectos */}
                                                        <div className="flex items-center gap-x-6">
                                                            <span className="font-medium">
                                                                Insectos:
                                                            </span>
                                                            {infestationLevels.map((level) => (
                                                                <FormField
                                                                    key={level.id}
                                                                    control={form.control}
                                                                    name="degreeInsectInfectivity"
                                                                    render={({ field }) => (
                                                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                                            <FormControl>
                                                                                <Checkbox
                                                                                    checked={field.value === level.id}
                                                                                    onCheckedChange={(checked) => (checked ? field.onChange(level.id) : field.onChange(undefined))
                                                                                    }
                                                                                />
                                                                            </FormControl>
                                                                            <FormLabel className="text-sm font-normal">
                                                                                {level.label}
                                                                            </FormLabel>
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            ))}
                                                        </div>

                                                        {/* Infestación de Roedores */}
                                                        <div className="flex items-center gap-x-6">
                                                            <span className="font-medium">
                                                                Roedores:
                                                            </span>
                                                            {infestationLevels.map((level) => (
                                                                <FormField
                                                                    key={level.id}
                                                                    control={form.control}
                                                                    name="degreeRodentInfectivity"
                                                                    render={({ field }) => (
                                                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                                            <FormControl>
                                                                                <Checkbox
                                                                                    checked={field.value === level.id}
                                                                                    onCheckedChange={(checked) => (checked ? field.onChange(level.id) : field.onChange(undefined))
                                                                                    }
                                                                                />
                                                                            </FormControl>
                                                                            <FormLabel className="text-sm font-normal">
                                                                                {level.label}
                                                                            </FormLabel>
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </form>
                        </Form>
                    </div>
                </Tabs>
            </div>

            <div className="sticky bottom-0 left-0 right-0 border-t bg-white dark:bg-background p-4 shadow-md z-10">
                <div className="flex justify-end gap-3 px-6">
                    <Button
                        type="button"
                        onClick={handleCancel}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <X className="h-4 w-4" />
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        onClick={async() =>
                        {
                            await form.handleSubmit(handleSubmit)();
                        }}
                        className="flex items-center gap-2"
                    >
                        <Save className="h-4 w-4" />
                        Guardar
                    </Button>
                    <Button type="button"
                        onClick={async() =>
                        {
                            await form.handleSubmit(handleSubmit)();
                            downloadExcel();
                        }}
                        form="projectForm"
                        className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                    >
                        <Download className="h-4 w-4" />
                        Generar Excel
                    </Button>
                    <Button
                        type="button"
                        onClick={async() =>
                        {
                            await form.handleSubmit(handleSubmit)();
                            downloadPDF();
                        }}
                        form="projectForm"
                        className="bg-red-500 hover:bg-red-600 flex items-center gap-2"
                    >
                        <Download className="h-4 w-4" />
                        Generar Pdf
                    </Button>
                </div>
            </div>
        </div>
    );
}

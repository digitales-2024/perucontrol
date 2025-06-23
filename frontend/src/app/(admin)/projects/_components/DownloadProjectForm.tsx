"use client";

import DatePicker from "@/components/ui/date-time-picker";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bug, BugOff, BugPlay, CalendarIcon, CircleUser, ClipboardList, Download, Droplets, FileDigit, Hash, LandPlot, LightbulbIcon, ListCheck, MilkOff, MousePointer2, Rat, Save, Send, SprayCan, SprayCanIcon, Users, X } from "lucide-react";
import { parseISO } from "date-fns";
import { useForm } from "react-hook-form";
import { downloadProjectSchema, type DownloadProjectSchema } from "../schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toastWrapper } from "@/types/toasts";
import { GenerateOperationSheetExcel, GenerateOperationSheetPDF, SaveProjectOperationSheetData, SendOperationSheetPDFViaEmail, SendOperationSheetPDFViaWhatsapp } from "../actions";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { components } from "@/types/api";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { DocumentSenderDialog } from "@/components/DocumentSenderDialog";

type ProjectSummarySingle = components["schemas"]["ProjectSummarySingle"];
type ProjectAppointment = ProjectSummarySingle["appointments"][number]

const infestationLevels = [
    { id: "High", label: "Alto" },
    { id: "Moderate", label: "Moderado" },
    { id: "Low", label: "Bajo" },
    { id: "Negligible", label: "Insignificante" },
];

export function DownloadProjectForm({
    project,
    client,
    appointment,
}: {
    project: components["schemas"]["ProjectSummarySingle"],
    client: components["schemas"]["Client"],
    appointment: ProjectAppointment,
})
{
    const router = useRouter();
    const [sendOpen, setSendOpen] = useState(false);

    const serviceNames = project.services.map((service) => service.name);
    // const serviceNames = appointment.servicesIds.map((service) => service);
    const operationSheet = appointment.projectOperationSheet;

    const servicesMap = useMemo(() =>
    {
        const map = new Map<string, string>();
        project.services.forEach((service) => map.set(service.id!, service.name));
        return map;
    }, [project]);

    const form = useForm<DownloadProjectSchema>({
        resolver: zodResolver(downloadProjectSchema),
        defaultValues: {
            projectAppointmentId: appointment.id!,
            enterTime: !!appointment.enterTime ? appointment.enterTime : undefined,
            leaveTime: !!appointment.leaveTime ? appointment.leaveTime : undefined,
            operationDate: operationSheet.operationDate ?? appointment.actualDate!,
            razonSocial: client.razonSocial ?? client.name,
            address: project.address,
            businessType: client.businessType ?? "",
            treatedAreas: operationSheet.treatedAreas ?? "",
            service: serviceNames,
            certificateNumber: appointment.certificateNumber !== null ? String(appointment.certificateNumber) : "",
            insects: operationSheet.insects ?? "",
            rodents: operationSheet.rodents ?? "",
            rodentConsumptionPartial: operationSheet.rodentConsumptionPartial ?? "",
            rodentConsumptionTotal: operationSheet.rodentConsumptionTotal ?? "",
            rodentConsumptionDeteriorated: operationSheet.rodentConsumptionDeteriorated ?? "",
            rodentConsumptionNone: operationSheet.rodentConsumptionNone ?? "",
            otherPlagues: operationSheet.otherPlagues ?? "",
            insecticide: operationSheet.insecticide ?? "",
            insecticide2: operationSheet.insecticide2 ?? "",
            rodenticide: operationSheet.rodenticide ?? "",
            desinfectant: operationSheet.desinfectant ?? "",
            otherProducts: operationSheet.otherProducts ?? "",
            insecticideAmount: operationSheet.insecticideAmount ?? "0",
            insecticideAmount2: operationSheet.insecticideAmount2 ?? "0",
            rodenticideAmount: operationSheet.rodenticideAmount ?? "0",
            desinfectantAmount: operationSheet.desinfectantAmount ?? "0",
            otherProductsAmount: operationSheet.otherProductsAmount ?? "0",
            staff1: operationSheet.staff1 ?? "",
            staff2: operationSheet.staff2 ?? "",
            staff3: operationSheet.staff3 ?? "",
            staff4: operationSheet.staff4 ?? "",
            aspersionManual: operationSheet.aspersionManual ?? false,
            aspercionMotor: operationSheet.aspercionMotor ?? false,
            nebulizacionFrio: operationSheet.nebulizacionFrio ?? false,
            nebulizacionCaliente: operationSheet.nebulizacionCaliente ?? false,
            colocacionCebosCebaderos: operationSheet.colocacionCebosCebaderos ?? "",
            numeroCeboTotal: operationSheet.numeroCeboTotal ?? "0",
            numeroCeboRepuestos: operationSheet.numeroCeboRepuestos ?? "0",
            nroPlanchasPegantes: operationSheet.nroPlanchasPegantes ?? "0",
            nroJaulasTomahawk: operationSheet.nroJaulasTomahawk ?? "0",
            degreeInsectInfectivity: operationSheet.degreeInsectInfectivity ?? "Moderate",
            degreeRodentInfectivity: operationSheet.degreeRodentInfectivity ?? "Moderate",
            observations: operationSheet.observations ?? "",
            recommendations: operationSheet.recommendations ?? "",
        },
    });

    const onSubmit = async(input: DownloadProjectSchema) =>
    {
        saveData(input);
    };

    const saveData = async(body: DownloadProjectSchema) =>
    {
        const [, saveError] = await toastWrapper(
            SaveProjectOperationSheetData(appointment.id!, body),
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
        // Genera el Excel
        const [blob, err] = await toastWrapper(GenerateOperationSheetExcel(appointment.id!), {
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
    };

    const downloadPDF = async() =>
    {
        const [blob, err] = await toastWrapper(GenerateOperationSheetPDF(appointment.id!), {
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
    };

    const handleSubmit = async(input: components["schemas"]["OperationSheetCreateDTO"]) =>
    {
        const [result, error] = await toastWrapper(
            SaveProjectOperationSheetData(appointment.id!, input),
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
        router.back();
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto">
                <Tabs defaultValue="general" className="w-full">
                    <div className="px-4 mt-5">
                        <TabsList className="w-full h-auto bg-[rgba(0,176,250,0.5)] text-zinc-700 font-bold p-1.5 rounded-xl flex flex-wrap gap-1">
                            <TabsTrigger
                                value="general" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg transition-all duration-200
                                hover:bg-white"
                            >
                                <ClipboardList className="h-4 w-4 mr-2" />
                                Información General
                            </TabsTrigger>
                            <TabsTrigger
                                value="plagas"
                                className="flex-1 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg transition-all duration-200
                                    hover:bg-white"
                            >
                                <Bug className="h-4 w-4 mr-2" />
                                Diagnóstico y Métodos
                            </TabsTrigger>
                            <TabsTrigger
                                value="metodos" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg transition-all duration-200
                                hover:bg-white"
                            >
                                <SprayCan className="h-4 w-4 mr-2" />
                                Productos e Infestación
                            </TabsTrigger>
                            <TabsTrigger
                                value="personal" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg transition-all duration-200
                                hover:bg-white"
                            >
                                <Users className="h-4 w-4 mr-2" />
                                Personal y Observaciones
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="mt-4 pb-20">
                        <Form {...form}>
                            <form id="projectForm" onSubmit={form.handleSubmit(onSubmit)} className="px-4">
                                <TabsContent value="general" className="mt-0 space-y-4">
                                    <Card className="bg-transparent border shadow-sm overflow-hidden">
                                        <OperationsCardHeader>
                                            Información General
                                        </OperationsCardHeader>
                                        <Separator />
                                        <CardContent className="pt-4">
                                            <div className="grid grid-cols-1 gap-6">
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
                                                                            const localDate = new Date(date);
                                                                            field.onChange(localDate.toISOString());
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

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <FormField
                                                        control={form.control}
                                                        name="enterTime"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="flex items-center gap-2 font-medium">
                                                                    <CalendarIcon className="h-4 w-4 text-blue-500" />
                                                                    Hora de Entrada
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="time"
                                                                        placeholder="--:--"
                                                                        {...field}
                                                                    />
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
                                                                    <CalendarIcon className="h-4 w-4 text-blue-500" />
                                                                    Hora de Salida
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="time"
                                                                        placeholder="--:--"
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-transparent border shadow-sm overflow-hidden">
                                        <OperationsCardHeader>
                                            Detalles del Servicio
                                        </OperationsCardHeader>
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
                                                                <Input disabled placeholder="Numero de certificado" {...field} />
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
                                                                {appointment.servicesIds?.map((service) => (
                                                                    <FormItem
                                                                        key={service}
                                                                        className="flex flex-row items-start space-x-3 space-y-0"
                                                                    >
                                                                        <FormLabel className="text-sm font-normal">
                                                                            {"- "}
                                                                            {servicesMap.get(service) ?? "-"}
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

                                <TabsContent value="plagas" className="mt-0 space-y-4">
                                    <Card className="border shadow-sm bg-transparent overflow-hidden">
                                        <OperationsCardHeader>
                                            Diagnóstico
                                        </OperationsCardHeader>
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
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    <div className="space-y-2">
                                                        <FormLabel className="flex items-center gap-2 font-medium">
                                                            Parcial:
                                                        </FormLabel>
                                                        <FormField
                                                            control={form.control}
                                                            name="rodentConsumptionPartial"
                                                            render={({ field }) => (
                                                                <FormItem className="flex flex-col items-center space-x-3 space-y-0">
                                                                    <FormControl>
                                                                        <Input placeholder="Parcial" {...field} />
                                                                    </FormControl>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <FormLabel className="flex items-center gap-2 font-medium">
                                                            Consumo Total:
                                                        </FormLabel>
                                                        <FormField
                                                            control={form.control}
                                                            name="rodentConsumptionTotal"
                                                            render={({ field }) => (
                                                                <FormItem className="flex flex-col items-center space-x-3 space-y-0">
                                                                    <FormControl>
                                                                        <Input placeholder="Total" {...field} />
                                                                    </FormControl>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <FormLabel className="flex items-center gap-2 font-medium">
                                                            Deteriorado:
                                                        </FormLabel>
                                                        <FormField
                                                            control={form.control}
                                                            name="rodentConsumptionDeteriorated"
                                                            render={({ field }) => (
                                                                <FormItem className="flex flex-col items-center space-x-3 space-y-0">
                                                                    <FormControl>
                                                                        <Input placeholder="Deteriorado" {...field} />
                                                                    </FormControl>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <FormLabel className="flex items-center gap-2 font-medium">
                                                            Sin Consumo:
                                                        </FormLabel>
                                                        <FormField
                                                            control={form.control}
                                                            name="rodentConsumptionNone"
                                                            render={({ field }) => (
                                                                <FormItem className="flex flex-col items-center space-x-3 space-y-0">
                                                                    <FormControl>
                                                                        <Input placeholder="Sin Consumo" {...field} />
                                                                    </FormControl>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
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

                                    <Card className="border shadow-sm overflow-hidden bg-transparent">
                                        <OperationsCardHeader>
                                            Método Utilizado
                                        </OperationsCardHeader>
                                        <Separator />
                                        <CardContent className="pt-4">
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-4 gap-4">
                                                    <h3 className="text-sm font-semibold flex items-center">
                                                        <SprayCanIcon className="h-4 w-4 text-blue-500 mr-2" />
                                                        Aspersión
                                                    </h3>

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
                                                        name="aspercionMotor"
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

                                                </div>
                                                {/* ---------------------------------------------------- */}
                                                <div className="grid grid-cols-4 gap-4">
                                                    <h3 className="text-sm font-semibold flex items-center">
                                                        <Droplets className="h-4 w-4 text-blue-500 mr-2" />
                                                        Nebulización
                                                    </h3>
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
                                                </div>

                                                {/* Colocacion de cebos */}
                                                <div className="grid grid-cols-4 gap-4">
                                                    <h3 className="text-sm font-semibold flex items-center">
                                                        <MousePointer2 className="h-4 w-4 text-blue-500 mr-2" />
                                                        Colocación de Cebos
                                                    </h3>
                                                    <div className="space-y-2">
                                                        <FormLabel className="flex items-center gap-2 font-medium">
                                                            Cebaderos:
                                                        </FormLabel>
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
                                                    </div>
                                                    <div className="space-y-2">
                                                        <FormLabel className="flex items-center gap-2 font-medium">
                                                            N° Cebos Total
                                                        </FormLabel>
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
                                                    </div>
                                                    <div className="space-y-2">
                                                        <FormLabel className="flex items-center gap-2 font-medium">
                                                            N° Cebos Repuestos
                                                        </FormLabel>
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
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-4 gap-4">
                                                    <h3 className="text-sm font-semibold flex items-center">
                                                        <MousePointer2 className="h-4 w-4 text-blue-500 mr-2" />
                                                        Colocación de Planchas Pegantes
                                                    </h3>
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

                                                    <h3 className="text-sm font-semibold flex items-center">
                                                        <MousePointer2 className="h-4 w-4 text-blue-500 mr-2" />
                                                        Colocación de Jaulas Tomahawk
                                                    </h3>
                                                    <FormField
                                                        control={form.control}
                                                        name="nroJaulasTomahawk"
                                                        render={({ field }) => (
                                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="N° Jaulas Tomahawk Total"
                                                                        {...field}
                                                                        onChange={(e) => field.onChange(e.target.value)}
                                                                    />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="metodos" className="mt-0 space-y-4">
                                    <Card className="border shadow-sm bg-transparent overflow-hidden">
                                        <OperationsCardHeader>
                                            Productos Utilizados
                                        </OperationsCardHeader>
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
                                                    name="rodenticideAmount"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2 font-medium">
                                                                <Hash className="h-4 w-4 text-blue-500" />
                                                                Cantidad de Rodenticida
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

                                    <Card className="border shadow-sm bg-transparent overflow-hidden">
                                        <OperationsCardHeader>
                                            Grado de Infestación
                                        </OperationsCardHeader>
                                        <Separator />
                                        <CardContent className="pt-4">
                                            <div className="space-y-6">
                                                {/* Infestación de insectos y roedores en filas */}
                                                <div className="grid md:grid-cols-2 gap-4">
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
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="personal" className="mt-0 space-y-4">
                                    <Card className="border shadow-sm bg-transparent overflow-hidden">
                                        <OperationsCardHeader>
                                            Personal que intervino en los trabajos
                                        </OperationsCardHeader>
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
                                                            <FormControl>
                                                                <Input placeholder="Nombre completo" {...field} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border shadow-sm bg-transparent overflow-hidden">
                                        <OperationsCardHeader>
                                            Orden, Limpieza, Infraestructura y Elementos Innecesarios
                                        </OperationsCardHeader>
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
                            </form>
                        </Form>
                    </div>
                </Tabs>
            </div>

            <div className="sticky bottom-0 left-0 right-0 border-t bg-white p-4 shadow-md z-10">
                <div className="flex justify-end gap-3 px-6">
                    <Button
                        type="button"
                        onClick={handleCancel}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <X className="h-4 w-4" />
                        Volver
                    </Button>

                    <div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="sm:hidden"
                            onClick={() => setSendOpen(true)}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden sm:flex items-center gap-2"
                            onClick={() => setSendOpen(true)}
                        >
                            <Send className="h-4 w-4" />
                            Enviar
                        </Button>
                        <DocumentSenderDialog
                            open={sendOpen}
                            setOpen={setSendOpen}
                            documentName="Ficha de Operaciones"
                            startingEmail={project.client?.email?.value ?? ""}
                            startingNumber={project.client?.phoneNumber?.value ?? ""}
                            pdfLoadAction={async() => GenerateOperationSheetPDF(appointment.id!)}
                            emailSendAction={async(d) => SendOperationSheetPDFViaEmail(appointment.id!, d)}
                            whatsappSendAction={async(d) => SendOperationSheetPDFViaWhatsapp(appointment.id!, d)}
                        />
                    </div>
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
                    <Button
                        type="button"
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

function OperationsCardHeader({ children }: { children: React.ReactNode })
{
    return (
        <CardHeader className="md:pt-3 md:pb-3 py-3 bg-primary text-primary-foreground">
            <CardTitle className="text-xl font-bold">
                {children}
            </CardTitle>
        </CardHeader>

    );
}

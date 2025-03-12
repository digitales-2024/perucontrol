"use client";

import DatePicker from "@/components/ui/date-time-picker";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bug, BugOff, BugPlay, Building2, CalendarClock, CalendarIcon, CircleUser, Download, FileDigit, Hash, LandPlot, ListCheck, MapPinHouse, Package, Rat, ScanHeart, SprayCan, SquareM, X } from "lucide-react";
import { format, parse } from "date-fns";
import { useForm } from "react-hook-form";
import { downloadProjectSchema, type DownloadProjectSchema } from "../schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toastWrapper } from "@/types/toasts";
import { GenerateExcel } from "../actions";
import { Project } from "../types";
import { useEffect } from "react";

export function DownloadProjectForm({ onOpenChange, project }: {
  onOpenChange: (v: boolean) => void,
  project: Project
 })
{
    const form = useForm<DownloadProjectSchema>({
        resolver: zodResolver(downloadProjectSchema),
        defaultValues: {
            operationDate: "",
            enterTime: "",
            leaveTime: "",
            razonSocial: "",
            address: "",
            businessType: "",
            sanitaryCondition: "",
            treatedAreas: "",
            service: "",
            certificateNumber: "",
            insects: "",
            rodents: "",
            otherPlagues: "",
            insecticide: "",
            rodenticide: "",
            desinfectant: "",
            otherProducts: "",
            insecticideAmount: "",
            rodenticideAmount: "",
            desinfectantAmount: "",
            otherProductsAmount: "",
            ratExtermination1: "",
            ratExtermination2: "",
            ratExtermination3: "",
            ratExtermination4: "",
            staff1: "",
            staff2: "",
            staff3: "",
            staff4: "",
        },
    });

    const { setValue } = form;

    useEffect(() =>
    {
        if (project.client)
        {
            setValue("razonSocial", project.client.razonSocial!);
            setValue("businessType", project.client.businessType!);
        }
        setValue("address", project.address!);
    }, [project, setValue]);

    const onSubmit = async(input: DownloadProjectSchema) =>
    {
        download(input);
    };

    const download = async(body: DownloadProjectSchema) =>
    {
        console.log("Body", body);
        const [blob, err] = await toastWrapper(GenerateExcel(project.id, body), {
            loading: "Generando archivo",
            success: "Excel generado",
        });

        if (err)
        {
            return;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "proyectos.xlsx";
        a.click();
        URL.revokeObjectURL(url);
        onOpenChange(false);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto">
                <Tabs defaultValue="general" className="w-full">
                    <div className="px-6">
                        <TabsList className="w-full h-12 bg-muted/50 p-1">
                            <TabsTrigger value="general" className="flex-1">
                                Información General
                            </TabsTrigger>
                            <TabsTrigger value="plagas" className="flex-1">
                                Plagas y Productos
                            </TabsTrigger>
                            <TabsTrigger value="cantidades" className="flex-1">
                                Cantidades
                            </TabsTrigger>
                            <TabsTrigger value="personal" className="flex-1">
                                Monitoreo y Personal
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="mt-4 pb-20">
                        <ScrollArea className="h-[calc(100vh-460px)]">
                            <Form {...form}>
                                <form id="projectForm" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-6">
                                    <TabsContent value="general" className="mt-0">
                                        <Card className="border shadow-sm">
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
                                                                        value={field.value ? parse(field.value, "yyyy-MM-dd", new Date()) : undefined}
                                                                        onChange={(date) =>
                                                                        {
                                                                            if (date)
                                                                            {
                                                                                const formattedDate = format(date, "yyyy-MM-dd");
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
                                                    Información del Cliente
                                                </CardTitle>
                                            </CardHeader>
                                            <Separator />
                                            <CardContent className="pt-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <FormField
                                                        control={form.control}
                                                        name="razonSocial"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="flex items-center gap-2 font-medium">
                                                                    <Package className="h-4 w-4 text-blue-500" />
                                                                    Razón Social
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="Ingrese la razón social" {...field} className="border-gray-300" />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="address"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="flex items-center gap-2 font-medium">
                                                                    <MapPinHouse className="h-4 w-4 text-blue-500" />
                                                                    Dirección
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="Dirección" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="businessType"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="flex items-center gap-2 font-medium">
                                                                    <Building2 className="h-4 w-4 text-blue-500" />
                                                                    Giro del Negocio
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="Giro del Negocio" {...field} />
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
                                                    Detalles del Servicio
                                                </CardTitle>
                                            </CardHeader>
                                            <Separator />
                                            <CardContent className="pt-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <FormField
                                                        control={form.control}
                                                        name="sanitaryCondition"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="flex items-center gap-2 font-medium">
                                                                    <ScanHeart className="h-4 w-4 text-blue-500" />
                                                                    Condición Sanitaria
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="Condición Sanitaria" {...field} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />

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
                                                        name="service"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="flex items-center gap-2 font-medium">
                                                                    <ListCheck className="h-4 w-4 text-blue-500" />
                                                                    Servicios Realizados
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="Servicios Realizados" {...field} />
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
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <FormField
                                                        control={form.control}
                                                        name="insects"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="flex items-center gap-2 font-medium">
                                                                    <Bug className="h-4 w-4 text-blue-500" />
                                                                    Insectos
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="Insectos" {...field} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="rodents"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="flex items-center gap-2 font-medium">
                                                                    <Rat className="h-4 w-4 text-blue-500" />
                                                                    Roedores
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="Roedores" {...field} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="otherPlagues"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="flex items-center gap-2 font-medium">
                                                                    <BugPlay className="h-4 w-4 text-blue-500" />
                                                                    Otras Plagas
                                                                </FormLabel>
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
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="cantidades" className="mt-0">
                                        <Card className="border shadow-sm">
                                            <CardHeader className="py-3">
                                                <CardTitle className="text-md font-medium">
                                                    Cantidades de Productos
                                                </CardTitle>
                                            </CardHeader>
                                            <Separator />
                                            <CardContent className="pt-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <FormField
                                                        control={form.control}
                                                        name="insecticideAmount"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="flex items-center gap-2 font-medium">
                                                                    <Hash className="h-4 w-4 text-blue-500" />
                                                                    Cantidad de Insecticida
                                                                </FormLabel>
                                                                <FormDescription>
                                                                    Indique la cantidad en ml o g
                                                                </FormDescription>
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
                                                        name="rodenticideAmount"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="flex items-center gap-2 font-medium">
                                                                    <Hash className="h-4 w-4 text-blue-500" />
                                                                    Cantidad de Rodenticida
                                                                </FormLabel>
                                                                <FormDescription>
                                                                    Indique la cantidad en ml o g
                                                                </FormDescription>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="Cantidad de Rodenticida"
                                                                        {...field}
                                                                    />
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
                                                                <FormDescription>
                                                                    Indique la cantidad en ml o g
                                                                </FormDescription>
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
                                                        name="otherProductsAmount"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="flex items-center gap-2 font-medium">
                                                                    <Hash className="h-4 w-4 text-blue-500" />
                                                                    Cantidad de Otros Productos
                                                                </FormLabel>
                                                                <FormDescription>
                                                                    Indique la cantidad en ml o g
                                                                </FormDescription>
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
                                    </TabsContent>

                                    <TabsContent value="personal" className="mt-0">
                                        <Card className="border shadow-sm">
                                            <CardHeader className="py-3">
                                                <CardTitle className="text-md font-medium">
                                                    Monitoreo de Desratización
                                                </CardTitle>
                                            </CardHeader>
                                            <Separator />
                                            <CardContent className="pt-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <FormField
                                                        control={form.control}
                                                        name="ratExtermination1"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="flex items-center gap-2 font-medium">
                                                                    <SquareM className="h-4 w-4 text-blue-500" />
                                                                    Monitoreo 1
                                                                </FormLabel>
                                                                <FormDescription>
                                                                    Fecha o detalles del primer monitoreo
                                                                </FormDescription>
                                                                <FormControl>
                                                                    <Input placeholder="Detalles del monitoreo 1" {...field} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="ratExtermination2"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="flex items-center gap-2 font-medium">
                                                                    <SquareM className="h-4 w-4 text-blue-500" />
                                                                    Monitoreo 2
                                                                </FormLabel>
                                                                <FormDescription>
                                                                    Fecha o detalles del segundo monitoreo
                                                                </FormDescription>
                                                                <FormControl>
                                                                    <Input placeholder="Detalles del monitoreo 2" {...field} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="ratExtermination3"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="flex items-center gap-2 font-medium">
                                                                    <SquareM className="h-4 w-4 text-blue-500" />
                                                                    Monitoreo 3
                                                                </FormLabel>
                                                                <FormDescription>
                                                                    Fecha o detalles del tercer monitoreo
                                                                </FormDescription>
                                                                <FormControl>
                                                                    <Input placeholder="Detalles del monitoreo 3" {...field} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="ratExtermination4"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="flex items-center gap-2 font-medium">
                                                                    <SquareM className="h-4 w-4 text-blue-500" />
                                                                    Monitoreo 4
                                                                </FormLabel>
                                                                <FormDescription>
                                                                    Fecha o detalles del cuarto monitoreo
                                                                </FormDescription>
                                                                <FormControl>
                                                                    <Input placeholder="Detalles del monitoreo 4" {...field} />
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
                                    </TabsContent>
                                </form>
                            </Form>
                        </ScrollArea>
                    </div>
                </Tabs>
            </div>

            <div className="sticky bottom-0 left-0 right-0 border-t bg-white p-4 shadow-md z-10">
                <div className="flex justify-end gap-3 px-6">
                    <Button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <X className="h-4 w-4" />
                        Cancelar
                    </Button>
                    <Button type="submit" form="projectForm" className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Generar Excel
                    </Button>
                </div>
            </div>
        </div>
    );
}


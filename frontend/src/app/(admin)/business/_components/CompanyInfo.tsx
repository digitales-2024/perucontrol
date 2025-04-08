"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { Building, Mail, Phone, User, CreditCard, Landmark, FileText, Save } from "lucide-react";
import { companyInfoSchema, CompanyInfoSchema } from "../schemas";
import { toastWrapper } from "@/types/toasts";
import { UpdateBusiness } from "../actions";
import { components } from "@/types/api";

export function CompanyInfoForm({ businessInfo }: { businessInfo: components["schemas"]["Business"] })
{
    const isMobile = useIsMobile();

    const form = useForm<CompanyInfoSchema>({
        resolver: zodResolver(companyInfoSchema),
        defaultValues: {
            digesaNumber: businessInfo.digesaNumber ?? "",
            address: businessInfo.address ?? "",
            email: businessInfo.email ?? "",
            ruc: businessInfo.ruc ?? "",
            phones: businessInfo.phones ?? "",
            directorName: businessInfo.directorName ?? "",
            bankName: businessInfo.bankName ?? "",
            bankAccount: businessInfo.bankAccount ?? "",
            bankCCI: businessInfo.bankCCI ?? "",
            deductions: businessInfo.deductions ?? "",
        },
    });

    async function onSubmit(data: CompanyInfoSchema)
    {
        const [, error] = await toastWrapper(UpdateBusiness(businessInfo.id!, data), {
            loading: "Cargando...",
            success: "Información de la empresa actualizada con éxito",
        });
        if (error !== null)
        {
            return;
        }
    }

    if (isMobile)
    {
        return (
            <div className="container mx-auto p-4">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Building className="h-5 w-5 text-primary" />
                            Información de la Empresa
                        </CardTitle>
                        <CardDescription>
                            Gestione la información de su empresa que aparecerá en documentos y cotizaciones
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="general" className="w-full">
                            <TabsList className="flex flex-wrap w-full h-auto mb-4">
                                <TabsTrigger value="general">
                                    General
                                </TabsTrigger>
                                <TabsTrigger value="contact">
                                    Contacto
                                </TabsTrigger>
                                <TabsTrigger value="bank">
                                    Banco
                                </TabsTrigger>
                            </TabsList>

                            <Form {...form}>
                                <form id="company-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <ScrollArea className="h-[calc(100vh-350px)]">
                                        <div className="pr-4">
                                            <TabsContent value="general" className="space-y-4 mt-0">
                                                <FormField
                                                    control={form.control}
                                                    name="digesaNumber"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2">
                                                                <FileText className="h-4 w-4 text-primary" />
                                                                Número DIGESA
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="ruc"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2">
                                                                <FileText className="h-4 w-4 text-primary" />
                                                                RUC
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="directorName"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2">
                                                                <User className="h-4 w-4 text-primary" />
                                                                Nombre del Director técnico
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="deductions"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2">
                                                                <FileText className="h-4 w-4 text-primary" />
                                                                Cuenta de detracciones
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Textarea className="resize-none min-h-[80px]" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TabsContent>

                                            <TabsContent value="contact" className="space-y-4 mt-0">
                                                <FormField
                                                    control={form.control}
                                                    name="address"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2">
                                                                <Building className="h-4 w-4 text-primary" />
                                                                Dirección
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Textarea
                                                                    className="resize-none min-h-[80px]"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="email"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2">
                                                                <Mail className="h-4 w-4 text-primary" />
                                                                Correo Electrónico
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="phones"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2">
                                                                <Phone className="h-4 w-4 text-primary" />
                                                                Teléfonos
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TabsContent>

                                            <TabsContent value="bank" className="space-y-4 mt-0">
                                                <FormField
                                                    control={form.control}
                                                    name="bankName"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2">
                                                                <Landmark className="h-4 w-4 text-primary" />
                                                                Nombre del Banco
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="bankAccount"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2">
                                                                <CreditCard className="h-4 w-4 text-primary" />
                                                                Número de Cuenta
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="bankCCI"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2">
                                                                <CreditCard className="h-4 w-4 text-primary" />
                                                                Código CCI
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TabsContent>
                                        </div>
                                    </ScrollArea>
                                </form>
                            </Form>
                        </Tabs>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                        <Button type="submit" form="company-form" className="flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            Guardar cambios
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <Card className="w-full max-w-4xl">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <Building className="h-6 w-6 text-primary" />
                        Información de la Empresa
                    </CardTitle>
                    <CardDescription>
                        Gestione la información de su empresa que aparecerá en documentos y cotizaciones
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form id="company-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium mb-4">
                                    Información General
                                </h3>
                                <Separator className="mb-4" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="digesaNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-primary" />
                                                    Constancia/Resolución directoral
                                                </FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="ruc"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-primary" />
                                                    RUC
                                                </FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="directorName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-primary" />
                                                    Nombre del Director técnico
                                                </FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="deductions"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-primary" />
                                                    Cuenta de detracciones
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea className="resize-none min-h-[80px]" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium mb-4">
                                    Información de Contacto
                                </h3>
                                <Separator className="mb-4" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel className="flex items-center gap-2">
                                                    <Building className="h-4 w-4 text-primary" />
                                                    Dirección
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        className="resize-none min-h-[80px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-primary" />
                                                    Correo Electrónico
                                                </FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="phones"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-primary" />
                                                    Teléfonos
                                                </FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium mb-4">
                                    Información Bancaria
                                </h3>
                                <Separator className="mb-4" />
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="bankName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <Landmark className="h-4 w-4 text-primary" />
                                                    Nombre del Banco
                                                </FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="bankAccount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <CreditCard className="h-4 w-4 text-primary" />
                                                    Número de Cuenta
                                                </FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="bankCCI"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <CreditCard className="h-4 w-4 text-primary" />
                                                    Código CCI
                                                </FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-end border-t pt-6">
                    <Button type="submit" form="company-form" className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Guardar cambios
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

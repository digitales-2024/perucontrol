// import {
//     Dialog,
//     DialogContent,
//     DialogDescription,
//     DialogFooter,
//     DialogHeader,
//     DialogTitle,
// } from "@/components/ui/dialog";
// import { GenerateExcel } from "../actions";
// import { toastWrapper } from "@/types/toasts";
// import { Button } from "@/components/ui/button";
// import { useForm } from "react-hook-form";
// import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { format, parse } from "date-fns";
// import { DownloadQuotationSchema, quotationDownloadSchema } from "../schemas";
// import { zodResolver } from "@hookform/resolvers/zod";
// import DatePicker from "@/components/ui/date-time-picker";
// import { CalendarIcon, Download, FileSpreadsheet, Package, Shield, X } from "lucide-react";
// import { Card, CardContent } from "@/components/ui/card";

// export function QuotationDownload({ open, onOpenChange, quotationId }: {
//     open: boolean,
//     onOpenChange: (v: boolean) => void,
//     quotationId: string,
//     disabled?: boolean,
// })
// {
//     const form = useForm<DownloadQuotationSchema>({
//         resolver: zodResolver(quotationDownloadSchema),
//         defaultValues: {
//             validUntil: "",
//             guarantee: "",
//             deliverables: "",
//         },
//     });

//     const onSubmit = async(input: DownloadQuotationSchema) =>
//     {
//         download(input);
//     };

//     const download = async(body: DownloadQuotationSchema) =>
//     {
//         const [blob, err] = await toastWrapper(GenerateExcel(quotationId, body), {
//             loading: "Generando archivo",
//             success: "Excel generado",
//         });

//         if (err)
//         {
//             return;
//         }

//         const url = URL.createObjectURL(blob);
//         const a = document.createElement("a");
//         a.href = url;
//         a.download = "cotizaciones.xlsx";
//         a.click();
//         URL.revokeObjectURL(url);
//         onOpenChange(false);
//     };

//     return (
//         <Dialog open={open} onOpenChange={onOpenChange}>
//             <DialogContent className="sm:max-w-md md:max-w-lg">
//                 <DialogHeader>
//                     <div className="flex justify-between items-center">
//                         <div className="flex items-center gap-2">
//                             <FileSpreadsheet className="h-5 w-5 text-blue-500" />
//                             <DialogTitle className="text-xl">
//                                 Generar documento de Cotización
//                             </DialogTitle>
//                         </div>
//                     </div>
//                     <DialogDescription>
//                         Complete los siguientes campos para generar el documento Excel de la cotización.
//                     </DialogDescription>
//                 </DialogHeader>

//                 <Card className="border-blue-100">
//                     <CardContent className="pt-6">
//                         <Form {...form}>
//                             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
//                                 <FormField
//                                     control={form.control}
//                                     name="validUntil"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel className="flex items-center gap-2 text-base font-medium">
//                                                 <CalendarIcon className="h-4 w-4 text-blue-500" />
//                                                 Fecha Limite
//                                             </FormLabel>
//                                             <FormDescription>
//                                                 Seleccione la fecha hasta la cual será válida esta cotización
//                                             </FormDescription>
//                                             <FormControl>
//                                                 <DatePicker
//                                                     value={field.value ? parse(field.value, "yyyy-MM-dd", new Date()) : undefined}
//                                                     onChange={(date) =>
//                                                     {
//                                                         if (date)
//                                                         {
//                                                             const formattedDate = format(date, "yyyy-MM-dd");
//                                                             field.onChange(formattedDate);
//                                                         }
//                                                         else
//                                                         {
//                                                             field.onChange("");
//                                                         }
//                                                     }}
//                                                 />
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />

//                                 <FormField
//                                     control={form.control}
//                                     name="guarantee"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel className="flex items-center gap-2 text-base font-medium">
//                                                 <Shield className="h-4 w-4 text-blue-500" />
//                                                 Garantía
//                                             </FormLabel>
//                                             <FormDescription>
//                                                 Especifique los términos de garantía para este servicio
//                                             </FormDescription>
//                                             <FormControl>
//                                                 <Input
//                                                     placeholder="Ej: Garantía de 30 días después del servicio"
//                                                     {...field}
//                                                     className="border-gray-300"
//                                                 />
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />

//                                 <FormField
//                                     control={form.control}
//                                     name="deliverables"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel className="flex items-center gap-2 text-base font-medium">
//                                                 <Package className="h-4 w-4 text-blue-500" />
//                                                 Entregables
//                                             </FormLabel>
//                                             <FormDescription>
//                                                 Detalle los documentos o productos que se entregarán al cliente
//                                             </FormDescription>
//                                             <FormControl>
//                                                 <Input
//                                                     placeholder="Ej: Certificado de servicio, informe técnico"
//                                                     {...field}
//                                                     className="border-gray-300"
//                                                 />
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />
//                             </form>
//                         </Form>
//                     </CardContent>
//                 </Card>

//                 <DialogFooter className="mt-6 flex justify-end gap-3">
//                     <Button onClick={() => onOpenChange(false)} variant="outline" className="flex items-center gap-2">
//                         <X className="h-4 w-4" />
//                         Cancelar
//                     </Button>
//                     <Button
//                         onClick={form.handleSubmit(onSubmit)}
//                         className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
//                     >
//                         <Download className="h-4 w-4" />
//                         Generar Excel
//                     </Button>
//                 </DialogFooter>
//             </DialogContent>
//         </Dialog>
//     );
// }

"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { GenerateExcel } from "../actions";
import { toastWrapper } from "@/types/toasts";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { format, parse } from "date-fns";
import { type DownloadQuotationSchema, quotationDownloadSchema } from "../schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import DatePicker from "@/components/ui/date-time-picker";
import { CalendarIcon, Download, FileSpreadsheet, Package, Shield, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";

export function QuotationDownload({
    open,
    onOpenChange,
    quotationId,
    disabled = false,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  quotationId: string
  disabled?: boolean
})
{
    const [isOpen, setIsOpen] = useState(open);
    const isMobile = useIsMobile();

    const form = useForm<DownloadQuotationSchema>({
        resolver: zodResolver(quotationDownloadSchema),
        defaultValues: {
            validUntil: "",
            guarantee: "",
            deliverables: "",
        },
    });

    // Sincronizar el estado interno con el prop open
    useEffect(() =>
    {
        setIsOpen(open);
    }, [open]);

    const handleOpenChange = (value: boolean) =>
    {
        setIsOpen(value);
        onOpenChange(value);
    };

    const onSubmit = async(input: DownloadQuotationSchema) =>
    {
        download(input);
    };

    const download = async(body: DownloadQuotationSchema) =>
    {
        const [blob, err] = await toastWrapper(GenerateExcel(quotationId, body), {
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
        a.download = "cotizaciones.xlsx";
        a.click();
        URL.revokeObjectURL(url);
        handleOpenChange(false);
    };

    // Contenido del formulario compartido entre ambas versiones
    const FormContent = () => (
        <Form {...form}>
            <form id="download-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                    control={form.control}
                    name="validUntil"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2 text-sm font-medium">
                                <CalendarIcon className="h-4 w-4 text-blue-500" />
                                Fecha Límite
                            </FormLabel>
                            <FormDescription className="text-xs">
                                Seleccione la fecha hasta la cual será válida esta cotización
                            </FormDescription>
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
                                    className="w-full"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="guarantee"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2 text-sm font-medium">
                                <Shield className="h-4 w-4 text-blue-500" />
                                Garantía
                            </FormLabel>
                            <FormDescription className="text-xs">
                                Especifique los términos de garantía para este servicio
                            </FormDescription>
                            <FormControl>
                                <Input
                                    placeholder="Ej: Garantía de 30 días después del servicio"
                                    {...field}
                                    className="border-gray-300"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="deliverables"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2 text-sm font-medium">
                                <Package className="h-4 w-4 text-blue-500" />
                                Entregables
                            </FormLabel>
                            <FormDescription className="text-xs">
                                Detalle los documentos o productos que se entregarán al cliente
                            </FormDescription>
                            <FormControl>
                                <Input
                                    placeholder="Ej: Certificado de servicio, informe técnico"
                                    {...field}
                                    className="border-gray-300"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    );

    // Versión móvil con Drawer
    if (isMobile)
    {
        return (
            <Drawer open={isOpen} onOpenChange={handleOpenChange}>
                {/* max-h-[90vh] */}
                <DrawerContent className="max-h-[90vh] flex flex-col">
                    <DrawerHeader className="text-left">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <FileSpreadsheet className="h-5 w-5 text-blue-500" />
                                <DrawerTitle className="text-lg font-semibold">
                                    Generar documento
                                </DrawerTitle>
                            </div>
                        </div>
                        <DrawerDescription className="text-sm">
                            Complete los campos para generar el Excel de la cotización
                        </DrawerDescription>
                    </DrawerHeader>

                    <Separator />

                    <div className="px-4 py-4 flex-1 overflow-auto">
                        <ScrollArea className="h-[calc(100vh-100px)]">
                            <Card className="border-blue-100 shadow-none">
                                <CardContent className="pt-4 px-2">
                                    <FormContent />
                                </CardContent>
                            </Card>
                        </ScrollArea>
                    </div>

                    <DrawerFooter className="pt-2 border-t flex-row gap-3">
                        <DrawerClose asChild>
                            <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
                                <X className="h-4 w-4" />
                                Cancelar
                            </Button>
                        </DrawerClose>
                        <Button
                            onClick={form.handleSubmit(onSubmit)}
                            className="bg-blue-600 hover:bg-blue-700 flex-1 flex items-center justify-center gap-2"
                            disabled={disabled}
                        >
                            <Download className="h-4 w-4" />
                            Generar Excel
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        );
    }

    // Versión de escritorio con Dialog
    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md md:max-w-lg">
                <DialogHeader>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5 text-blue-500" />
                            <DialogTitle className="text-xl">
                                Generar documento de Cotización
                            </DialogTitle>
                        </div>
                    </div>
                    <DialogDescription>
                        Complete los siguientes campos para generar el documento Excel de la cotización.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh]">
                    <Card className="border-blue-100">
                        <CardContent className="pt-6">
                            <FormContent />
                        </CardContent>
                    </Card>
                </ScrollArea>

                <DialogFooter className="mt-4 flex justify-end gap-3">
                    <Button onClick={() => handleOpenChange(false)} variant="outline" className="flex items-center gap-2">
                        <X className="h-4 w-4" />
                        Cancelar
                    </Button>
                    <Button
                        onClick={form.handleSubmit(onSubmit)}
                        className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                        disabled={disabled}
                    >
                        <Download className="h-4 w-4" />
                        Generar Excel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { GenerateExcel } from "../actions";
import { toastWrapper } from "@/types/toasts";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { format, parse } from "date-fns";
import { DownloadQuotationSchema, quotationDownloadSchema } from "../schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import DatePicker from "@/components/ui/date-time-picker";
import { CalendarIcon, Download, FileSpreadsheet, Package, Shield, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function QuotationDownload({ open, onOpenChange, quotationId }: {
    open: boolean,
    onOpenChange: (v: boolean) => void,
    quotationId: string,
})
{
    const form = useForm<DownloadQuotationSchema>({
        resolver: zodResolver(quotationDownloadSchema),
        defaultValues: {
            validUntil: "",
            guarantee: "",
            deliverables: "",
        },
    });

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
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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

                <Card className="border-blue-100">
                    <CardContent className="pt-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                <FormField
                                    control={form.control}
                                    name="validUntil"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2 text-base font-medium">
                                                <CalendarIcon className="h-4 w-4 text-blue-500" />
                                                Fecha del Proyecto
                                            </FormLabel>
                                            <FormDescription>
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
                                            <FormLabel className="flex items-center gap-2 text-base font-medium">
                                                <Shield className="h-4 w-4 text-blue-500" />
                                                Garantía
                                            </FormLabel>
                                            <FormDescription>
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
                                            <FormLabel className="flex items-center gap-2 text-base font-medium">
                                                <Package className="h-4 w-4 text-blue-500" />
                                                Entregables
                                            </FormLabel>
                                            <FormDescription>
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
                    </CardContent>
                </Card>

                <DialogFooter className="mt-6 flex justify-end gap-3">
                    <Button onClick={() => onOpenChange(false)} variant="outline" className="flex items-center gap-2">
                        <X className="h-4 w-4" />
                        Cancelar
                    </Button>
                    <Button
                        onClick={form.handleSubmit(onSubmit)}
                        className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Download className="h-4 w-4" />
                        Generar Excel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

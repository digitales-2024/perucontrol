"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Calendar } from "lucide-react";
import { toastWrapper } from "@/types/toasts";
import { ExportProjectsCSV } from "../actions";

interface ExportCSVDialogProps
{
    trigger?: React.ReactNode;
}

export function ExportCSVDialog({ trigger }: ExportCSVDialogProps)
{
    const [open, setOpen] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [loading, setLoading] = useState(false);

    const handleExport = async() =>
    {
        setLoading(true);

        await toastWrapper(
            (async() =>
            {
                const [blob, error] = await ExportProjectsCSV(
                    startDate || undefined,
                    endDate || undefined,
                );

                if (error)
                {
                    throw error;
                }

                // Create download link
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;

                // Generate filename
                let filename = "projects_export";
                if (startDate || endDate)
                {
                    filename += "_";
                    if (startDate) filename += `from_${startDate.replace(/-/g, "")}`;
                    if (endDate) filename += `_to_${endDate.replace(/-/g, "")}`;
                }
                filename += `_${new Date()
                    .toISOString()
                    .slice(0, 19)
                    .replace(/[-:T]/g, "")}.csv`;

                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                setOpen(false);
                setStartDate("");
                setEndDate("");

                return [blob, null];
            })(),
            {
                loading: "Exportando proyectos...",
                success: "CSV exportado exitosamente",
            },
        );

        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar CSV
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5 text-primary" />
                        Exportar Proyectos a CSV
                    </DialogTitle>
                    <DialogDescription>
                        Selecciona un rango de fechas para filtrar los proyectos por fecha de creación.
                        Si no especificas fechas, se exportarán todos los proyectos.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="startDate" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Fecha de inicio (opcional)
                        </Label>
                        <Input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            max={endDate || undefined}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="endDate" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Fecha de fin (opcional)
                        </Label>
                        <Input
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate || undefined}
                        />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-700">
                            <strong>
                                Nota:
                            </strong>
                            {" "}
                            Si no especificas una fecha de inicio, se exportarán todos los proyectos desde el primer registro.
                            Si no especificas una fecha de fin, se exportarán hasta la fecha actual.
                        </p>
                    </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleExport}
                        disabled={loading}
                        className="flex items-center gap-2"
                    >
                        <Download className="h-4 w-4" />
                        {loading ? "Exportando..." : "Exportar CSV"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

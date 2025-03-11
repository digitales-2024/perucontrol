import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { GenerateExcel } from "../actions";
import { toastWrapper } from "@/types/toasts";
import { Button } from "@/components/ui/button";

export function QuotationDownload({ open, onOpenChange, quotationId }: {
    open: boolean,
    onOpenChange: (v: boolean) => void,
    quotationId: string,
})
{
    const download = async() =>
    {
        const [blob, err] = await toastWrapper(GenerateExcel(quotationId), {
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
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Generar documento de Cotización
                    </DialogTitle>
                    <DialogDescription>
                        Ingrese la información necesaria para generar la cotización.
                    </DialogDescription>

                    <div className="flex gap-2 justify-end">
                        <Button onClick={() => onOpenChange(false)} variant="destructive">
                            Cancelar
                        </Button>
                        <Button onClick={download}>
                            Descargar
                        </Button>
                    </div>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}

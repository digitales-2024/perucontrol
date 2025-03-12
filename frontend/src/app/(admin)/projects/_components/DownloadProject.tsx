import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { DownloadProjectForm } from "./DownloadProjectForm";
import { FileSpreadsheet } from "lucide-react";

export function DownloadProject({ open, onOpenChange, projectId }: {
    open: boolean,
    onOpenChange: (v: boolean) => void,
    projectId: string,
})
{
    console.log("ProyectId", projectId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[95vw] md:max-w-[80vw] lg:max-w-[1000px] max-h-[90vh] p-0 flex flex-col">
                <DialogHeader className="p-6 pb-2">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5 text-blue-500" />
                            <DialogTitle className="text-xl">
                                Generar documento de Proyecto
                            </DialogTitle>
                        </div>
                    </div>
                    <DialogDescription>
                        Complete los siguientes campos para generar el documento Excel del proyecto.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden">
                    <DownloadProjectForm onOpenChange={onOpenChange} />
                </div>
            </DialogContent>
        </Dialog>
    );
}

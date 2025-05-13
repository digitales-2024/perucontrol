"use client";

import { useState, useEffect } from "react";
import { FileIcon, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UploadMurinoMap } from "../actions";
import { toastWrapper } from "@/types/toasts";
import { useRouter } from "next/navigation";

interface MurinoMapSectionProps {
    murinoMapBase64?: string | null;
    appointmentId: string;
}

type PreviewType = {
    type: "image" | "pdf";
    url: string;
    name?: string;
};

export function MurinoMapSection({ murinoMapBase64, appointmentId }: MurinoMapSectionProps)
{
    const router = useRouter();
    const [murinoMapFile, setMurinoMapFile] = useState<File | null>(null);
    const [murinoMapPreview, setMurinoMapPreview] = useState<PreviewType | null>(null);
    const [uploading, setUploading] = useState(false);

    // Resetear preview cuando cambia el base64 del padre
    useEffect(() =>
    {
        setMurinoMapPreview(null);
    }, [murinoMapBase64]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    {
        const file = e.target.files?.[0] ?? null;
        setMurinoMapFile(file);

        if (file)
        {
            if (file.type === "application/pdf")
            {
                setMurinoMapPreview({
                    type: "pdf",
                    url: URL.createObjectURL(file),
                    name: file.name,
                });
            }
            else
            {
                const reader = new FileReader();
                reader.onloadend = () =>
                {
                    setMurinoMapPreview({
                        type: "image",
                        url: reader.result as string,
                    });
                };
                reader.readAsDataURL(file);
            }
        }
        else
        {
            setMurinoMapPreview(null);
        }
    };

    const handleUpload = async() =>
    {
        if (!murinoMapFile) return;
        const formData = new FormData();
        formData.append("murinoMap", murinoMapFile);

        setUploading(true);
        await toastWrapper(UploadMurinoMap(appointmentId, formData), {
            loading: "Subiendo mapa murino...",
            success: "Mapa murino subido correctamente",
        });

        // Resetear estados y refrescar
        setMurinoMapFile(null);
        const fileInput = document.getElementById("murino-map-upload") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        router.refresh();

        setUploading(false);
    };

    const hasChange = !!murinoMapFile;

    return (
        <div className="mt-8 space-y-4">
            <h3 className="text-base md:text-lg font-medium flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                Mapa Murino
            </h3>
            <hr className="border-t border-gray-200" />

            <div className="flex flex-col items-center gap-2 min-h-[220px] justify-center">
                {murinoMapPreview ? (
                    murinoMapPreview.type === "pdf" ? (
                        <Button
                            variant="link"
                            onClick={() => window.open(murinoMapPreview.url, "_blank")}
                        >
                            <FileIcon className="mr-1 h-3 w-3" />
                            Ver PDF
                            {"  "}
                            {murinoMapPreview.name}
                        </Button>
                    ) : (
                        <img
                            src={murinoMapPreview.url}
                            alt="Vista previa del mapa murino"
                            className="w-full max-w-md rounded border"
                        />
                    )
                ) : murinoMapBase64 ? (
                    murinoMapBase64.startsWith("data:application/pdf") ? (
                        <Button
                            variant="link"
                            onClick={() => window.open(murinoMapBase64, "_blank")}
                        >
                            <FileIcon className="mr-1 h-3 w-3" />
                            Ver PDF
                        </Button>
                    ) : (
                        <img
                            src={murinoMapBase64}
                            alt="Vista previa del mapa murino"
                            className="w-full max-w-md rounded border"
                        />
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-8">
                        <MapPin className="h-12 w-12 text-blue-300 mb-2" />
                        <span className="text-base font-medium">
                            Sube un nuevo mapa murino para este proyecto
                        </span>
                        <span className="text-xs text-gray-400 mt-1">
                            No se ha subido ningún mapa aún
                        </span>
                    </div>
                )}
            </div>

            <div className="flex flex-col sm:flex-row items-end gap-4">
                <div className="flex-1">
                    <Label htmlFor="murino-map-upload" className="block mb-2">
                        Subir nuevo archivo
                    </Label>
                    <input
                        id="murino-map-upload"
                        type="file"
                        accept="image/png, application/pdf"
                        className="block w-full text-sm text-gray-500
                               file:mr-4 file:py-2 file:px-4
                               file:rounded file:border-0
                               file:text-sm file:font-semibold
                               file:bg-blue-50 file:text-blue-700
                               hover:file:bg-blue-100"
                        onChange={handleFileChange}
                    />
                </div>
                <Button
                    onClick={handleUpload}
                    disabled={!hasChange || uploading}
                    className="bg-blue-700 hover:bg-blue-800"
                >
                    {uploading ? "Subiendo..." : "Subir"}
                </Button>
            </div>
        </div>
    );
}

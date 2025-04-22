"use client";

import { useState} from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UploadMurinoMap } from "../actions";
import { toastWrapper } from "@/types/toasts";

interface MurinoMapSectionProps {
    murinoMapBase64?: string | null;
    projectId: string;
}

export function MurinoMapSection({ murinoMapBase64, projectId }: MurinoMapSectionProps)
{
    const [murinoMapFile, setMurinoMapFile] = useState<File | null>(null);
    const [murinoMapPreview, setMurinoMapPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    // Determina si hay un cambio real (archivo seleccionado y preview distinto al base64 actual)
    const hasChange =
        !!murinoMapFile &&
        (murinoMapPreview !== null) &&
        (murinoMapPreview !== `data:image/png;base64,${murinoMapBase64}`);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    {
        const file = e.target.files?.[0] ?? null;
        setMurinoMapFile(file);
        if (file)
        {
            const reader = new FileReader();
            reader.onloadend = () =>
            {
                const result = reader.result as string;
                setMurinoMapPreview(result);
            };
            reader.readAsDataURL(file);
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
        await toastWrapper(UploadMurinoMap(projectId, formData), {
            loading: "Subiendo mapa murino...",
            "success": "Mapa murino subido correctamente",
        });
        setUploading(false);
    };

    return (
        <div className="mt-8 space-y-4">
            <h3 className="text-base md:text-lg font-medium flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                Mapa Murino
            </h3>
            <hr className="border-t border-gray-200 dark:border-gray-700" />

            {/* Imagen mostrada */}
            <div className="flex flex-col items-center gap-2 min-h-[220px] justify-center">
                {murinoMapPreview ? (
                    <img
                        src={murinoMapPreview}
                        alt="Vista previa del mapa murino"
                        className="w-full max-w-md rounded border"
                    />
                ) : murinoMapBase64 ? (
                    <img
                        src={`data:image/png;base64,${murinoMapBase64}`}
                        alt="Mapa Murino"
                        className="w-full max-w-md rounded border"
                    />
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

            {/* Subida de nueva imagen */}
            <div className="flex flex-col sm:flex-row items-end gap-4">
                <div className="flex-1">
                    <Label htmlFor="murino-map-upload" className="block mb-2">
                        Subir nuevo mapa
                    </Label>
                    <input
                        id="murino-map-upload"
                        type="file"
                        accept="image/*"
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
                    type="button"
                    className="bg-blue-700 hover:bg-blue-800"
                    onClick={handleUpload}
                    disabled={!hasChange || uploading}
                    aria-disabled={!hasChange || uploading}
                >
                    {uploading ? "Subiendo..." : "Subir"}
                </Button>
            </div>
        </div>
    );
}

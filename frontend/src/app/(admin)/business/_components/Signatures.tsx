"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, Save } from "lucide-react";
import { useState } from "react";
import { toastWrapper } from "@/types/toasts";
import { UpdateSignatures } from "../actions";

type SignaturesFormValues = {
    signature1: FileList;
    signature2: FileList;
};

type thechnicalDirector = {
  name?: string,
  position?: string,
  cip?: string,
}

type responsible = {
  name?: string,
  position?: string,
  cip?: string,
}

const signatureArray = [
    ["signature1", "Director Técnico", "Nombre", "Cargo", "CIP"],
    ["signature2", "Responsable", "Nombre", "Cargo", "CIP"],
];

interface SignaturesFormProps {
  initialImages?: [string?, string?],
  thechnicalDirector?: thechnicalDirector,
  responsible?: responsible
}

export function SignaturesForm({ initialImages, thechnicalDirector, responsible }: SignaturesFormProps)
{
    const form = useForm<SignaturesFormValues>();
    const [previews, setPreviews] = useState<[string?, string?, string?]>([
        initialImages?.[0],
        initialImages?.[1],
    ]);
    const [loading, setLoading] = useState(false);

    async function onSubmit(data: SignaturesFormValues)
    {
        setLoading(true);
        const formData = new FormData();
        if (data.signature1?.[0]) formData.append("signature1", data.signature1[0]);
        if (data.signature2?.[0]) formData.append("signature2", data.signature2[0]);

        await toastWrapper(UpdateSignatures(formData), {
            loading: "Actualizando imágenes...",
            success: "Imágenes actualizadas",
        });
        setLoading(false);
        // Optionally show a toast or reload images
    }

    function handlePreview(field: keyof SignaturesFormValues, files: FileList | null)
    {
        if (files && files[0])
        {
            const reader = new FileReader();
            reader.onload = (e) =>
            {
                setPreviews((prev) =>
                {
                    const idx = field === "signature1" ? 0 : field === "signature2" ? 1 : 2;
                    const copy = [...prev] as [string?, string?, string?];
                    copy[idx] = e.target?.result as string;
                    return copy;
                });
            };
            reader.readAsDataURL(files[0]);
        }
    }

    return (
        <div className="container mx-auto p-6 bg-transparent">
            <Card className="w-full max-w-4xl">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <ImageIcon className="h-6 w-6 text-primary" />
                        Firmas de Certificado
                    </CardTitle>
                    <CardDescription>
                        Configure las firmas de los certificados generados.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form id="signatures-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {signatureArray.map(([field, name], idx) =>
                                {
                                    const info = field === "signature1" ? thechnicalDirector : responsible;
                                    return (
                                        <div key={idx}>
                                            <FormField
                                                key={field}
                                                control={form.control}
                                                name={field as keyof SignaturesFormValues}
                                                render={({ field: f }) => (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-2">
                                                            <ImageIcon className="h-4 w-4 text-primary" />
                                                            {name}
                                                        </FormLabel>
                                                        {previews[idx] && (
                                                            <img
                                                                src={previews[idx]}
                                                                alt={`Firma ${idx + 1}`}
                                                                className="mb-2 rounded border h-24 object-contain w-full"
                                                            />
                                                        )}
                                                        <p className="text-xs text-muted-foreground mb-2">
                                                            Cargar una nueva imágen:
                                                        </p>
                                                        <FormControl>
                                                            <Input
                                                                type="file"
                                                                accept="image/png"
                                                                onChange={(e) =>
                                                                {
                                                                    const files = e.target.files;
                                                                    if (files && files[0] && files[0].type !== "image/png")
                                                                    {
                                                                        e.target.value = ""; // Reset input
                                                                        return;
                                                                    }
                                                                    f.onChange(files);
                                                                    handlePreview(field as keyof SignaturesFormValues, files);
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="mt-5 space-y-2 text-sm font-medium text-gray-800">
                                                <div className="flex gap-2 items-center">
                                                    <span className="w-10">
                                                        Nombre:
                                                    </span>
                                                    <span className="border-b border-dashed border-gray-400 flex-1 py-0.5">
                                                        {info?.name ?? ""}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2 items-center">
                                                    <span className="w-10">
                                                        Cargo:
                                                    </span>
                                                    <span className="border-b border-dashed border-gray-400 flex-1 py-0.5">
                                                        {info?.position ?? ""}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2 items-center">
                                                    <span className="w-10">
                                                        CIP:
                                                    </span>
                                                    <span className="border-b border-dashed border-gray-400 flex-1 py-0.5">
                                                        {info?.cip ?? ""}
                                                    </span>
                                                </div>
                                            </div>

                                        </div>

                                    );
                                })}
                            </div>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-end border-t pt-6">
                    <Button
                        type="submit"
                        form="signatures-form"
                        className="flex items-center gap-2"
                        disabled={loading}
                    >
                        <Save className="h-4 w-4" />
                        Guardar firmas
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

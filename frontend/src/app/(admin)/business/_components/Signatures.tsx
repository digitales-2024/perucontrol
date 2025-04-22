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
    signature3: FileList;
};

export function SignaturesForm({ initialImages }: { initialImages?: [string?, string?, string?] })
{
    const form = useForm<SignaturesFormValues>();
    const [previews, setPreviews] = useState<[string?, string?, string?]>([
        initialImages?.[0],
        initialImages?.[1],
        initialImages?.[2],
    ]);
    const [loading, setLoading] = useState(false);

    async function onSubmit(data: SignaturesFormValues)
    {
        setLoading(true);
        const formData = new FormData();
        if (data.signature1?.[0]) formData.append("signature1", data.signature1[0]);
        if (data.signature2?.[0]) formData.append("signature2", data.signature2[0]);
        if (data.signature3?.[0]) formData.append("signature3", data.signature3[0]);

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
        <div className="container mx-auto p-6">
            <Card className="w-full max-w-4xl">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <ImageIcon className="h-6 w-6 text-primary" />
                        Firmas digitales
                    </CardTitle>
                    <CardDescription>
                        Configure las firmas que aparecen en los documentos generados por el sistema.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form id="signatures-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {["signature1", "signature2", "signature3"].map((field, idx) => (
                                    <FormField
                                        key={field}
                                        control={form.control}
                                        name={field as keyof SignaturesFormValues}
                                        render={({ field: f }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <ImageIcon className="h-4 w-4 text-primary" />
                                                    Firma
                                                    {" "}
                                                    {idx + 1}
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
                                ))}
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

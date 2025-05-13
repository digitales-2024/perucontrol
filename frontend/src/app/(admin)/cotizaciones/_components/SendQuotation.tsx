"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Mail, PhoneCall, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { GeneratePdf, SendQuotationPdfViaMail } from "../actions";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export function SendQuotation({ id, startingEmail }: { id: string, startingEmail: string })
{
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState(startingEmail);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    useEffect(() =>
    {
        if (!open) return;

        (async() =>
        {
            const [pdfBlob, error] = await GeneratePdf(id);
            if (!!error)
            {
                alert("error");
                return;
            }

            const dataUrl = URL.createObjectURL(pdfBlob);
            setPdfUrl(dataUrl);
        })();

        return () =>
        {
            if (pdfUrl)
            {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [open]);

    const sendEmail = async() =>
    {
        const [, error] = await SendQuotationPdfViaMail(id, email);
        if (!!error)
        {
            alert("error :c");
        }
    };

    return (
        <Dialog onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div>
                    <Button
                        variant="outline"
                        size="icon"
                        className="sm:hidden"
                    >
                        <Send className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        className="hidden sm:flex items-center gap-2"
                    >
                        <Send className="h-4 w-4" />
                        Enviar
                    </Button>
                </div>
            </DialogTrigger>
            <DialogContent className="w-[90vw] h-[40rem] md:max-w-[60rem]">
                <DialogHeader>
                    <DialogTitle>
                        Enviar cotización
                    </DialogTitle>
                    <DialogDescription>
                        Enviar la cotización en PDF por Correo o Whatsapp.
                    </DialogDescription>

                    {!!pdfUrl ? (
                        <iframe
                            src={pdfUrl}
                            width="100%"
                            title="PDF Preview"
                            className="h-[26rem] pdf-viewer"
                        />
                    ) : (
                        <Skeleton className="w-full h-[26rem] rounded" />
                    )}

                    <div className="grid grid-cols-[1.25rem_10rem_auto_5rem] items-center gap-2">
                        <Mail />
                        <span>
                            Enviar por correo a:
                        </span>
                        <Input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="correo@ejemplo.com"
                        />
                        <Button onClick={sendEmail}>
                            <Mail />
                            Enviar
                        </Button>
                    </div>
                    <div className="grid grid-cols-[1.25rem_10rem_auto_5rem] items-center gap-2">
                        <PhoneCall />
                        <span>
                            Enviar por WhatsApp a:
                        </span>
                        <Input />
                        <Button className="bg-green-600 text-white">
                            <PhoneCall />
                            Enviar
                        </Button>
                    </div>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}


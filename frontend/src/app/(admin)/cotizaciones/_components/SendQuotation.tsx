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
import { Mail, OctagonAlert, PhoneCall, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toastWrapper } from "@/types/toasts";
import { FetchError } from "@/types/backend";
import { Result } from "@/utils/result";

type SenderProps = {
    startingEmail: string,
    startingNumber: string,
    pdfLoadAction: () => Promise<Result<Blob, FetchError>>,
    emailSendAction: (email: string) => Promise<Result<null, FetchError>>
    whatsappSendAction: (number: string) => Promise<Result<null, FetchError>>
}

export function DocumentSenderDialog({ startingEmail, startingNumber, pdfLoadAction, emailSendAction, whatsappSendAction }: SenderProps)
{
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState(startingEmail);
    const [phoneNumber, setPhoneNumber] = useState(startingNumber);
    const [error, setError] = useState("");
    const [sending, setSending] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    useEffect(() =>
    {
        if (!open) return;

        (async() =>
        {
            const [pdfBlob, error] = await pdfLoadAction();
            if (!!error)
            {
                setError("Error cargando PDF");
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
        setSending(true);
        const [, error] = await toastWrapper(emailSendAction(email), {
            loading: "Enviando correo",
            success: "Correo enviado con éxito",
        });
        setSending(false);

        if (!!error)
        {
            setError(error.message);
        }
    };

    const sendWhatsapp = async() =>
    {
        setSending(true);
        const [, error] = await toastWrapper(whatsappSendAction(phoneNumber), {
            loading: "Enviando correo",
            success: "Correo enviado con éxito",
        });
        setSending(false);

        if (!!error)
        {
            setError(error.message);
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

                    <form
                        className="grid grid-cols-[1.25rem_10rem_auto_5rem] items-center gap-2"
                        onSubmit={(e) =>
                        {
                            e.preventDefault();
                            sendEmail();
                        }}
                    >
                        <Mail />
                        <span>
                            Enviar por correo a:
                        </span>
                        <Input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="correo@ejemplo.com"
                        />
                        <Button
                            type="submit"
                            disabled={sending}
                        >
                            <Mail />
                            Enviar
                        </Button>
                    </form>
                    <form
                        className="grid grid-cols-[1.25rem_10rem_auto_5rem] items-center gap-2"
                        onSubmit={(e) =>
                        {
                            e.preventDefault();
                            sendWhatsapp();
                        }}
                    >
                        <PhoneCall />
                        <span>
                            Enviar por WhatsApp a:
                        </span>
                        <Input
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="correo@ejemplo.com"
                        />
                        <Button
                            type="submit"
                            className="bg-green-600 text-white hover:bg-green-500"
                            disabled={sending}
                        >
                            <PhoneCall />
                            Enviar
                        </Button>
                    </form>
                    {error && (
                        <div className="text-red-500 flex items-center gap-2">
                            <OctagonAlert />
                            Error:
                            {" "}
                            {error}
                        </div>
                    )}
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}


"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Mail, OctagonAlert, PhoneCall } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toastWrapper } from "@/types/toasts";
import { FetchError } from "@/types/backend";
import { Result } from "@/utils/result";
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";

type SenderProps = {
    open: boolean,
    setOpen: (open: boolean) => void,
    documentName: string,
    startingEmail: string,
    startingNumber: string,
    pdfLoadAction: () => Promise<Result<Blob, FetchError>>,
    emailSendAction: (email: string) => Promise<Result<null, FetchError>>
    whatsappSendAction: (number: string) => Promise<Result<null, FetchError>>
}

export function DocumentSenderDialog({ open, setOpen, documentName, startingEmail, startingNumber, pdfLoadAction, emailSendAction, whatsappSendAction }: SenderProps)
{
    const [email, setEmail] = useState(startingEmail);
    const [phoneNumber, setPhoneNumber] = useState(startingNumber);
    const [error, setError] = useState("");
    const [sending, setSending] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const isMobile = useIsMobile();

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
        setError("");
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
        setError("");
        setSending(true);
        const [, error] = await toastWrapper(whatsappSendAction(phoneNumber), {
            loading: "Enviando mensaje de whatsapp",
            success: "Mensaje enviado con éxito",
        });
        setSending(false);

        if (!!error)
        {
            setError(error.message);
        }
    };

    if (isMobile)
    {
        return <SenderContentMobile open={open} setOpen={setOpen} pdfUrl={pdfUrl} />;
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="w-[90vw] h-[40rem] md:max-w-[60rem]">
                <DialogHeader>
                    <DialogTitle>
                        Enviar
                        {" "}
                        {documentName}
                    </DialogTitle>
                    <DialogDescription>
                        Enviar
                        {" "}
                        {documentName}
                        {" "}
                        en PDF por Correo o Whatsapp.
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

function SenderContentMobile({ open, setOpen, pdfUrl }: { open: boolean, setOpen: (open: boolean) => void, pdfUrl: string | null })
{
    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerContent>
                <DrawerHeader className="py-1 px-2 md:p-4">
                    <DrawerTitle>
                        Enviar cotización
                    </DrawerTitle>
                </DrawerHeader>
                <div className="grid grid-cols-3 px-2 gap-2">
                    <button className="flex items-center justify-center gap-2 hover:bg-gray-100 cursor-pointer py-1">
                        <img className="h-6" src="/icons/whatsapp_240.png" alt="Whatsapp" />
                    </button>
                    <button className="flex items-center justify-center gap-2 hover:bg-gray-100 cursor-pointer py-1">
                        <img className="h-6" src="/icons/gmail.png" alt="Gmail" />
                    </button>
                    <button className="flex items-center justify-center gap-2 hover:bg-gray-100 cursor-pointer py-1">
                        <img className="h-6" src="/icons/printer.png" alt="Imprimir" />
                    </button>
                </div>

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
            </DrawerContent>
        </Drawer>
    );
}


"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
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
    const [openWhatsapp, setOpenWhatsapp] = useState(false);
    const [openGmail, setOpenGmail] = useState(false);
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

    return (
        <>
            {isMobile ? (
                <SenderContentMobile
                    open={open} setOpen={setOpen} pdfUrl={pdfUrl}
                    openWhatsapp={() => setOpenWhatsapp(true)}
                    openGmail={() => setOpenGmail(true)}
                />
            ) : (

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="w-[90vw] h-[40rem] md:max-w-[60rem] max-h-[90vh]">
                        <div className="grid grid-rows-[3rem_auto_2rem]">
                            <DialogHeader>
                                <DialogTitle className="grid grid-cols-2 items-center gap-2">
                                    <span>
                                        Enviar
                                        {" "}
                                        {documentName}
                                    </span>
                                    <div className="flex items-center justify-end px-2 gap-2">
                                        <button
                                            className="flex items-center justify-center gap-2 hover:bg-gray-100 cursor-pointer py-1 px-2"
                                            onClick={() => setOpenWhatsapp(true)}
                                        >
                                            <img className="h-6" src="/icons/whatsapp_240.png" alt="Whatsapp" />
                                        </button>
                                        <button
                                            className="flex items-center justify-center gap-2 hover:bg-gray-100 cursor-pointer py-1 px-2"
                                            onClick={() => setOpenGmail(true)}
                                        >
                                            <img className="h-6" src="/icons/gmail.png" alt="Gmail" />
                                        </button>
                                        {/*
                                    <button className="flex items-center justify-center gap-2 hover:bg-gray-100 cursor-pointer py-1 px-2">
                                        <img className="h-6" src="/icons/printer.png" alt="Imprimir" />
                                    </button>
                                    */}
                                    </div>
                                </DialogTitle>
                            </DialogHeader>

                            {!!pdfUrl ? (
                                <iframe
                                    src={pdfUrl}
                                    width="100%"
                                    title="PDF Preview"
                                    className="inline-block h-full pdf-viewer"
                                />
                            ) : (
                                <Skeleton className="w-full  rounded" />
                            )}

                            {error && (
                                <div className="text-red-500 flex items-center gap-2">
                                    <OctagonAlert />
                                    Error:
                                    {" "}
                                    {error}
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog >
            )
            }
            <Dialog open={openWhatsapp} onOpenChange={setOpenWhatsapp}>
                <DialogContent>
                    <DialogTitle>
                        Enviar por Whatsapp
                    </DialogTitle>
                    <form
                        className="grid gap-2"
                        onSubmit={(e) =>
                        {
                            e.preventDefault();
                            sendWhatsapp();
                        }}
                    >
                        <div className="flex items-center gap-2">
                            <span>
                                +51
                            </span>
                            <Input
                                type="number"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                required
                                placeholder=""
                            />
                        </div>
                        <div className="text-right">
                            <Button
                                type="submit"
                                className="bg-green-600 text-white hover:bg-green-500"
                                disabled={sending}
                            >
                                <PhoneCall />
                                Enviar
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
            <Dialog open={openGmail} onOpenChange={setOpenGmail}>
                <DialogContent>
                    <DialogTitle>
                        Enviar por Gmail
                    </DialogTitle>
                    <form
                        className="grid gap-2"
                        onSubmit={(e) =>
                        {
                            e.preventDefault();
                            sendEmail();
                        }}
                    >
                        <div className="flex items-center gap-2">
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="correo@ejemplo.com"
                            />
                        </div>
                        <div className="text-right">
                            <Button
                                type="submit"
                                disabled={sending}
                            >
                                <Mail />
                                Enviar
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

function SenderContentMobile({
    open,
    setOpen,
    pdfUrl,
    openWhatsapp,
    openGmail,
}: {
    open: boolean,
    setOpen: (open: boolean) => void,
    pdfUrl: string | null,
    openWhatsapp: () => void
    openGmail: () => void
})
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
                    <button
                        className="flex items-center justify-center gap-2 hover:bg-gray-100 cursor-pointer py-1"
                        onClick={openWhatsapp}
                    >
                        <img className="h-6" src="/icons/whatsapp_240.png" alt="Whatsapp" />
                    </button>
                    <button
                        className="flex items-center justify-center gap-2 hover:bg-gray-100 cursor-pointer py-1"
                        onClick={openGmail}
                    >
                        <img className="h-6" src="/icons/gmail.png" alt="Gmail" />
                    </button>
                    {/*
                    <button className="flex items-center justify-center gap-2 hover:bg-gray-100 cursor-pointer py-1 px-2">
                        <img className="h-6" src="/icons/printer.png" alt="Imprimir" />
                    </button>
                    */}
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

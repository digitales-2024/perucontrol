"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
    Calendar,
    CheckCircle2,
    Clock,
    CreditCard,
    Edit,
    FileText,
    MapPin,
    Pencil,
    Shield,
    User,
    XCircle,
    Check,
    X,
    Copy,
    Send,
} from "lucide-react";
import { ViewClientDetails } from "../../clients/_components/ViewClientsDetail";
import { components } from "@/types/api";
import { GeneratePdf, SendQuotationPdfViaMail, SendQuotationPdfViaWhatsapp } from "../actions";
import { DocumentSenderDialog } from "@/components/DocumentSenderDialog";
import { PenCurrencyIcon } from "@/components/PenCurrencyIcon";

export function ViewQuotationDetails({ quotation }: { quotation: components["schemas"]["Quotation2"] })
{
    const { id: quotationId } = useParams();
    const router = useRouter();
    const [showClientDetails, setShowClientDetails] = useState(false);
    const [sendOpen, setSendOpen] = useState(false);

    const getStatusBadge = (status: string) =>
    {
        switch (status)
        {
        case "Approved":
            return (
                <Badge variant="approved">
                    Aprobado
                </Badge>
            );
        case "Rejected":
            return (
                <Badge variant="destructive">
                    Rechazado
                </Badge>
            );
        case "Pending":
        default:
            return (
                <Badge variant="default">
                    Pendiente
                </Badge>
            );
        }
    };

    const getStatusIcon = (status: string) =>
    {
        switch (status)
        {
        case "Approved":
            return <CheckCircle2 className="h-5 w-5 text-green-500" />;
        case "Rejected":
            return <XCircle className="h-5 w-5 text-red-500" />;
        case "Pending":
        default:
            return <Clock className="h-5 w-5 text-amber-500" />;
        }
    };

    const formatDate = (dateString: string) =>
    {
        try
        {
            const date = parseISO(dateString);
            return format(date, "d 'de' MMMM, yyyy", { locale: es });
        }
        catch (error)
        {
            console.error("Fecha no disponible", error);
        }
    };

    return (
        <div className="container mx-auto md:p-4 p-0 space-y-6">

            {/* Tarjeta principal de información */}
            <Card className="bg-transparent">
                <CardHeader className="pb-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <CardTitle className="text-xl md:text-2xl">
                                    Cotización #
                                    {quotation.quotationNumber ?? "Sin número"}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(quotation.status)}
                                    {getStatusBadge(quotation.status)}
                                </div>
                            </div>
                            <CardDescription>
                                Creada el
                                {" "}
                                {formatDate(quotation.creationDate)}
                            </CardDescription>
                        </div>

                        <div className="flex flex-wrap items-center justify-evenly space-x-2 gap-1">
                            {quotation.isActive && (
                                <>
                                    <div>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="sm:hidden"
                                            onClick={() => setSendOpen(true)}
                                        >
                                            <Send className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            variant="outline"
                                            className="hidden sm:flex items-center gap-2"
                                            onClick={() => setSendOpen(true)}
                                        >
                                            <Send className="h-4 w-4" />
                                            Enviar
                                        </Button>
                                    </div>

                                    <DocumentSenderDialog
                                        open={sendOpen}
                                        setOpen={setSendOpen}
                                        documentName="Cotización"
                                        startingEmail={quotation.client?.email?.value ?? ""}
                                        startingNumber={quotation.client?.phoneNumber?.value ?? ""}
                                        pdfLoadAction={async() =>
                                        {
                                            const [[data], err] = await GeneratePdf(quotation.id!);
                                            return [data, err];
                                        }}
                                        emailSendAction={async(email) => SendQuotationPdfViaMail(quotation.id!, email)}
                                        whatsappSendAction={async(number) => SendQuotationPdfViaWhatsapp(quotation.id!, number)}
                                    />

                                    <div>
                                        {/* Botón para pantallas pequeñas */}
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="sm:hidden"
                                            onClick={() => router.push(`/quotations/${quotationId}/edit`)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>

                                        {/* Botón para pantallas grandes */}
                                        <Button
                                            variant="outline"
                                            className="hidden sm:flex items-center gap-2"
                                            onClick={() => router.push(`/cotizaciones/${quotationId}/update`)}
                                        >
                                            <Edit className="h-4 w-4" />
                                            Editar
                                        </Button>
                                    </div>

                                    <div>
                                        {/* Botón para pantallas pequeñas */}
                                        <Button
                                            variant="outline"
                                            // className="hidden sm:flex items-center gap-2"
                                            className="sm:hidden"
                                            onClick={() =>
                                            {
                                                localStorage.setItem(
                                                    "duplicateQuotation",
                                                    JSON.stringify({
                                                        ...quotation,
                                                        creationDate: quotation.creationDate,
                                                        expirationDate: quotation.expirationDate,
                                                    }),
                                                );
                                                router.push("/cotizaciones/nuevo");
                                            }}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>

                                        {/* Botón para pantallas grandes */}
                                        <Button
                                            variant="outline"
                                            className="hidden sm:flex items-center gap-2"
                                            onClick={() =>
                                            {
                                                localStorage.setItem(
                                                    "duplicateQuotation",
                                                    JSON.stringify({
                                                        ...quotation,
                                                        creationDate: quotation.creationDate,
                                                        expirationDate: quotation.expirationDate,
                                                    }),
                                                );
                                                router.push("/cotizaciones/nuevo");
                                            }}
                                        >
                                            <Copy className="h-4 w-4" />
                                            Duplicar Cotización
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="grid gap-4">
                    {/* Información del cliente */}
                    <div className="space-y-2 mt-4">
                        <h3 className="text-sm md:text-lg font-medium flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-500" />
                            Información del Cliente
                        </h3>
                        <Separator />
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex flex-wrap justify-between items-start">
                                <div>
                                    <h4 className="font-medium text-xs md:text-base">
                                        {quotation.client?.name === "-" ? quotation.client?.razonSocial : quotation.client?.name}
                                    </h4>
                                    <p className="text-xs md:text-sm text-muted-foreground">
                                        {quotation.client?.documentInfo?.type?.toUpperCase()}
                                        :
                                        {quotation.client?.documentInfo?.value}
                                    </p>
                                </div>
                                <div className="bg-gray-50 px-4 rounded-lg">
                                    <h4 className="font-medium text-sm text-muted-foreground mb-2">
                                        Ubicación
                                    </h4>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-4 w-4 text-blue-500 mt-0.5" />
                                        <span className="text-xs md:text-base">
                                            {quotation.serviceAddress || "Dirección no disponible"}
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowClientDetails(true)}
                                    className="text-blue-500"
                                >
                                    Ver detalles
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Información de fechas y estado */}
                    <div className="space-y-2">
                        <h3 className="text-sm md:text-lg font-medium flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-500" />
                            Fechas y Estado
                        </h3>
                        <Separator />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                                    Fecha de Creación
                                </h4>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-blue-500" />
                                    <span className="text-xs md:text-base">
                                        {formatDate(quotation.creationDate)}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                                    Fecha de Expiración
                                </h4>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-blue-500" />
                                    <span className="text-xs md:text-base">
                                        {formatDate(quotation.expirationDate)}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                                    Estado
                                </h4>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(quotation.status)}
                                    <span className="text-xs md:text-base">
                                        {getStatusBadge(quotation.status)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Información de pago */}
                    <div className="space-y-2">
                        <h3 className="text-sm md:text-lg font-medium flex items-center gap-2">
                            <PenCurrencyIcon width={26} height={26} fill="var(--color-blue-500)" />
                            Información de Pago
                        </h3>
                        <Separator />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                                    Método de Pago
                                </h4>
                                <div className="flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-blue-500" />
                                    <span className="text-xs md:text-base">
                                        {quotation.paymentMethod || "No especificado"}
                                    </span>
                                </div>
                                {quotation.others && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Otros:
                                        {quotation.others}
                                    </p>
                                )}
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                                    IGV
                                </h4>
                                <div className="flex items-center">
                                    {quotation.hasTaxes ? (
                                        <Check className="h-5 w-5 text-green-500 mr-1" />
                                    ) : (
                                        <X className="h-5 w-5 text-red-500 mr-1" />
                                    )}
                                    <span className="text-xs md:text-base">
                                        {quotation.hasTaxes ? "Incluido" : "No incluido"}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                                    Frecuencia
                                </h4>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-blue-500" />
                                    <span className="text-xs md:text-base">
                                        {quotation.frequency === "Bimonthly"
                                            ? "Bimestral"
                                            : quotation.frequency === "Quarterly"
                                                ? "Trimestral"
                                                : quotation.frequency === "Semiannual"
                                                    ? "Semestral"
                                                    : quotation.frequency === "Monthly"
                                                        ? "No especificada"
                                                        : quotation.frequency === "Fortnightly"
                                                            ? "Quincenal"
                                                            : "No especificada"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Información del servicio */}
                    <div className="space-y-2">
                        <h3 className="text-sm md:text-lg font-medium flex items-center gap-2">
                            <Shield className="h-5 w-5 text-blue-500" />
                            Detalles del Servicio
                        </h3>
                        <Separator />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                                    Servicios
                                </h4>
                                <div className="space-y-4">
                                    {quotation.quotationServices && quotation.quotationServices.length > 0 ? (
                                        quotation.quotationServices.map((service, index) => (
                                            <div
                                                key={service.id ?? `service-${index}`}
                                                className="border rounded-md p-3 bg-white shadow-sm"
                                            >
                                                <p className="text-sm font-semibold">
                                                    {service.nameDescription}
                                                </p>

                                                <div className="text-sm text-muted-foreground space-y-1 mt-1">
                                                    <p>
                                                        Cantidad:
                                                        {service.amount}
                                                    </p>
                                                    {service.price !== undefined && (
                                                        <p>
                                                            Precio unitario: $
                                                            {service.price!.toFixed(2)}
                                                        </p>
                                                    )}
                                                    {service.accesories && (
                                                        <p>
                                                            Equipos:
                                                            {service.accesories}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground">
                                            No hay servicios registrados
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                                    Productos a utilizar
                                </h4>
                                <div className="flex flex-col">
                                    <div className="flex flex-col mb-2">
                                        <h5 className="font-bold">
                                            Insecticida:
                                        </h5>
                                        <div className="flex items-baseline gap-2">
                                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                                            <p className="text-xs md:text-sm">
                                                {quotation.desinsectant}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col mb-2">
                                        <h5 className="font-bold">
                                            Rodenticida:
                                        </h5>
                                        <div className="flex items-baseline gap-2">
                                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                                            <p className="text-xs md:text-sm">
                                                {quotation.derodent}
                                            </p>
                                        </div>

                                    </div>

                                    <div className="flex flex-col mb-2">
                                        <h5 className="font-bold">
                                            Desinfectante:
                                        </h5>
                                        <div className="flex items-baseline gap-2">
                                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                                            <p className="text-xs md:text-sm">
                                                {quotation.disinfectant}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Descripción y detalles */}
                    <div className="space-y-2">
                        <h3 className="text-sm md:text-lg font-medium flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-500" />
                            Descripción y Detalles
                        </h3>
                        <Separator />
                        <div className="grid grid-cols-1 gap-4">
                            {quotation.termsAndConditions?.map((term, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-sm text-muted-foreground mb-2">
                                        Término
                                        {" "}
                                        {index + 1}
                                    </h4>
                                    <p className="text-sm md:text-base whitespace-pre-line">
                                        {term || "No especificado"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Modales y diálogos */}
            {quotation.client && (
                <ViewClientDetails
                    open={showClientDetails}
                    onOpenChange={setShowClientDetails}
                    client={quotation.client}
                    showTrigger={false}
                />
            )}

        </div>

    );
}

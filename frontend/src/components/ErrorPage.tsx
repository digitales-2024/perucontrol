"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GeneralErrorProps extends React.HTMLAttributes<HTMLDivElement> {
    minimal?: boolean;
}

export default function ErrorGeneral({ className, minimal = false }: GeneralErrorProps)
{
    const router = useRouter();

    return (
        <div className={cn("flex w-full justify-center p-4 md:p-8", className)}>
            <Card className="max-w-md border-destructive/20 shadow-md">
                <CardHeader className="flex flex-row items-center gap-2 border-b pb-4">
                    <AlertCircle className="h-6 w-6 text-destructive" />
                    <h2 className="text-lg font-semibold">
                        Error del sistema
                    </h2>
                </CardHeader>
                <CardContent className="pt-6">
                    {!minimal && (
                        <div className="mb-4 flex justify-center">
                            <div className="rounded-full bg-destructive/10 p-3">
                                <span className="text-3xl font-bold text-destructive">
                                    500
                                </span>
                            </div>
                        </div>
                    )}
                    <div className="space-y-2 text-center">
                        <p className="font-medium">
                            ¡Ups! Algo salió mal
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Disculpa las molestias. Por favor, inténtalo de nuevo más tarde.
                        </p>
                    </div>
                </CardContent>
                {!minimal && (
                    <CardFooter className="flex justify-center gap-3 pt-2">
                        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                            Recargar página
                        </Button>
                        <Button size="sm" onClick={() => router.push("/")}>
                            Ir al Inicio
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}


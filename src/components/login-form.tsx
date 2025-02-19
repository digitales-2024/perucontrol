"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginAction } from "@/app/(auth)/login/actions";

const loginSchema = z.object({
    email: z.string()
        .email({ message: "Correo invalido" })
        .min(3, { message: "El correo debe tener al menos 3 caracteres" })
        .max(50, { message: "El correo debe tener como máximo 50 caracteres" }),
    password: z.string()
        .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
        .max(64, { message: "La contraseña debe tener como máximo 64 caracteres" }),
});
type LoginSchema = z.infer<typeof loginSchema>

export function LoginForm({
    className,
}: React.ComponentPropsWithoutRef<"form">)
{
    async function login(values: LoginSchema)
    {
        const res = await LoginAction(values.email, values.password);
        if (res)
        {
            alert(res.error);
        }
    }

    const form = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    return (
        <Form   {...form}>
            <form
                className={cn("flex flex-col gap-6", className)}
                onSubmit={form.handleSubmit(login)}
            >
                <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">
                        Inicia sesión
                    </h1>
                    <p className="text-balance text-sm text-muted-foreground">
                        Necesitas iniciar sesión para ingresar al sistema.
                    </p>
                </div>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="email">
                                        Correo electrónico
                                    </FormLabel>
                                    <FormControl>
                                        <Input id="email" type="email" placeholder="administracion@perucontrol.com" required {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid gap-2">
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center">
                                        <FormLabel htmlFor="password">
                                            Contraseña
                                        </FormLabel>
                                    </div>

                                    <FormControl>
                                        <Input id="password" type="password" required {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button type="submit" className="w-full">
                        Iniciar sesión
                    </Button>
                </div>
                <div className="h-16" />
            </form>
        </Form>
    );
}

"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { components } from "@/types/api";
import { UpdateUserProfile } from "@/app/root/actions";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type User = components["schemas"]["UserReturn"];

interface UserEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User;
}

const formSchema = z.object({
    name: z.string().min(1, "El nombre es obligatorio."),
    email: z.string().email("Email inválido."),
    password: z
        .string()
        .optional()
        .or(z.literal(""))
        .refine(
            (val) => !val ||
                (val.length >= 8 &&
                    /[A-Z]/.test(val) &&
                    /[a-z]/.test(val) &&
                    /[0-9]/.test(val) &&
                    /[^A-Za-z0-9]/.test(val)),
            {
                message:
                    "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.",
            },
        ),
});

type FormValues = z.infer<typeof formSchema>;

export function UserEditDialog({ open, onOpenChange, user }: UserEditDialogProps)
{
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: user.name,
            email: user.email,
            password: "",
        },
    });

    const {
        handleSubmit,
        formState: { isSubmitting, isDirty },
        reset,
        setError,
    } = form;

    async function onSubmit(values: FormValues)
    {
        const [, error] = await UpdateUserProfile({
            name: values.name,
            email: values.email,
            password: values.password ?? undefined,
        });

        if (error)
        {
            setError("root", { message: "No se pudo actualizar el perfil." });
            return;
        }

        onOpenChange(false);
        reset(values); // Optionally reset form to new values
    }

    React.useEffect(() =>
    {
        if (open)
        {
            reset({
                name: user.name,
                email: user.email,
                password: "",
            });
        }
    }, [open, user, reset]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Editar información de usuario
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form
                        className="space-y-4 mt-2"
                        onSubmit={handleSubmit(onSubmit)}
                        autoComplete="off"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Nombre
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Email
                                    </FormLabel>
                                    <FormControl>
                                        <Input type="email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Contraseña
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Nueva contraseña"
                                            autoComplete="new-password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {form.formState.errors.root && (
                            <div className="text-red-600 text-sm">
                                {form.formState.errors.root.message}
                            </div>
                        )}
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || !isDirty}
                            >
                                {isSubmitting ? "Guardando..." : "Guardar"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

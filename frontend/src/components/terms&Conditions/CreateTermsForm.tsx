import { z } from "zod";
import { CreateTermsAndConditions } from "../../app/(admin)/cotizaciones/actions";
import { toastWrapper } from "@/types/toasts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

const createTermsSchema = z.object({
    name: z.string().min(2, { message: "El nombre no puede estar vacio" })
        .max(100),
    terms: z.string().min(2, { message: "Los terminos no pueden estar vacios" }),
});
type CreateTermsSchema = z.infer<typeof createTermsSchema>

export default function CreateTermsForm({ onClose }: { onClose: (v: boolean) => void })
{
    const form = useForm<CreateTermsSchema>({
        resolver: zodResolver(createTermsSchema),
        defaultValues: {
            name: "",
            terms: "",
        },
    });

    async function onSubmit(values: CreateTermsSchema)
    {
        const promise = CreateTermsAndConditions({
            name: values.name,
            content: values.terms,
        });

        toastWrapper(promise, {
            success: "Términos y Condiciones creados con éxito",
            loading: "Creando...",
        });

        await promise;

        form.reset();
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 pt-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Nombre de la plantilla
                            </FormLabel>
                            <FormControl>
                                <Input placeholder="Nombre de la plantilla" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="terms"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Terminos
                            </FormLabel>
                            <FormControl>
                                <Textarea rows={4} placeholder="Términos y condiciones" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <Button type="submit">
                        Crear Plantilla
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => onClose(false)}>
                        Cancelar
                    </Button>
                </div>
            </form>
        </Form>
    );
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray,  UseFormReturn } from "react-hook-form";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Sheet,

} from "@/components/ui/sheet";
import { CreateSupplierSchema } from "../../_schemas/createSuppliersSchema";

interface UpdateSuppliersFormProps
	extends Omit<
		React.ComponentPropsWithRef<typeof Sheet>,
		"open" | "onOpenChange"
	> {
	children: React.ReactNode;
	form: UseFormReturn<CreateSupplierSchema>;
	onSubmit: (data: CreateSupplierSchema) => void;
}

export default function UpdateSuppliersForm({
    children,
    form,
    onSubmit,
}: UpdateSuppliersFormProps)
{
    // Add this after your existing form fields, before the SheetFooter
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "supplierLocations",
    });

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-4 px-6"
            >
                <div>
                    {/* RUC */}
                    <FormField
                        control={form.control}
                        name="rucNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    RUC
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Ingrese el RUC"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Razón Social */}
                    <FormField
                        control={form.control}
                        name="businessName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Razón Social
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Ingrese la razón social"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Tipo de Negocio */}
                    <FormField
                        control={form.control}
                        name="businessType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Tipo de Negocio
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Ingrese el tipo de negocio"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Nombre Comercial */}
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Nombre Comercial
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Ingrese el nombre comercial"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Nombre de Contacto */}
                    <FormField
                        control={form.control}
                        name="contactName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Nombre de Contacto
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Ingrese el nombre de contacto"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Dirección Principal */}
                    <FormField
                        control={form.control}
                        name="fiscalAddress"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Dirección Fiscal
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Dirección fiscal"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Teléfono */}
                    <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel htmlFor="phoneNumber">
                                    Teléfono
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        id="phone"
                                        placeholder="Ingrese el número de teléfono"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Correo Electrónico */}
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel htmlFor="email">
                                    Correo Electrónico
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        id="email"
                                        placeholder="Ingrese el correo electrónico"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Direcciones Adicionales */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-2 w-full"
                                onClick={() => append({ address: "" })}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Agregar dirección
                            </Button>
                        </div>

                        {fields.map((field, index) => (
                            <div key={field.id} className="flex gap-2">
                                <FormField
                                    control={form.control}
                                    name={`supplierLocations.${index}.address`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <Input
                                                    placeholder={`Dirección secundaria ${
                                                        index + 1
                                                    }`}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10"
                                    onClick={() => remove(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                {children}
            </form>
        </Form>
    );
}

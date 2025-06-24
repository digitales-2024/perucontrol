import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet";
import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { toastWrapper } from "@/types/toasts";
import { Supplier } from "../../_types/Suppliers";
import {
    CreateSupplierSchema,
    supplierSchema,
} from "../../_schemas/createSuppliersSchema";
import { UpdateSupplier } from "../../_actions/SupplierActions";
import { ScrollArea } from "@/components/ui/scroll-area";
import UpdateSuppliersForm from "./UpdateSuppliersForm";

interface UpdateSupplierProps {
	supplier: Supplier;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function UpdateSupplierSheet({
    supplier,
    open,
    onOpenChange,
}: UpdateSupplierProps)
{
    const form = useForm<CreateSupplierSchema>({
        resolver: zodResolver(supplierSchema),
        defaultValues: {
            rucNumber: supplier?.rucNumber ?? "",
            businessName: supplier?.businessName ?? "",
            businessType: supplier?.businessType ?? "",
            name: supplier?.name ?? "",
            fiscalAddress: supplier?.fiscalAddress ?? "",
            email: supplier?.email ?? "",
            contactName: supplier?.contactName ?? "",
            phoneNumber: supplier?.phoneNumber ?? "",
        },
    });
    const { reset } = form;

    useEffect(() =>
    {
        if (open)
        {
            form.reset({
                rucNumber: supplier?.rucNumber ?? "",
                businessName: supplier?.businessName ?? "",
                businessType: supplier?.businessType ?? "",
                name: supplier?.name ?? "",
                fiscalAddress: supplier?.fiscalAddress ?? "",
                email: supplier?.email ?? "",
                contactName: supplier?.contactName ?? "",
                phoneNumber: supplier?.phoneNumber ?? "",
            });
        }
    }, [open, supplier, form]);

    const onSubmit = async(input: CreateSupplierSchema) =>
    {
        const [, err] = await toastWrapper(
            UpdateSupplier(supplier.id!, input),
            {
                loading: "Cargando...",
                success: "¡Proveedor actualizado exitosamente!",
            },
        );
        if (err !== null)
        {
            return;
        }
        reset();
        onOpenChange(false);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                className="flex flex-col gap-6 sm:max-w-md h-full overflow-hidden"
                tabIndex={undefined}
            >
                <SheetHeader className="text-left pb-0">
                    <SheetTitle className="flex flex-col items-start">
                        Actualizar Proveedor
                    </SheetTitle>
                    <SheetDescription>
                        Llena todos los campos para actualizar el proveedor
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="w-full h-[calc(100vh-150px)] p-0">
                    <UpdateSuppliersForm form={form} onSubmit={onSubmit}>
                        <SheetFooter>
                            <Button type="submit">
                                Guardar
                            </Button>
                        </SheetFooter>
                    </UpdateSuppliersForm>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}

// "use client";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { ArrowLeft, Loader, Plus, Search, Trash2 } from "lucide-react";
// import { useForm, useFieldArray } from "react-hook-form";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { SheetFooter } from "@/components/ui/sheet";
// import React, { useState } from "react";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { clientSchema, CreateClientSchema } from "../schemas";
// import { RegisterClient, SearchClientByRuc } from "../actions";
// import { toastWrapper } from "@/types/toasts";
// import { useRouter } from "next/navigation";

// export const CreateClient = () =>
// {
//     const [typeDocument, setTypeDocument] = useState("");
//     const [loading, setLoading] = useState(false);
//     const router = useRouter();

//     const form = useForm<CreateClientSchema>({
//         resolver: zodResolver(clientSchema),
//         defaultValues: {
//             typeDocument: "",
//             typeDocumentValue: "",
//             razonSocial: "",
//             businessType: "",
//             name: "",
//             fiscalAddress: "",
//             email: "",
//             contactName: "",
//             clientLocations: [
//                 {
//                     address: "",
//                 },
//             ],
//             phoneNumber: "",
//         },
//     });

//     const { reset, setValue } = form;

//     const { fields, append, remove } = useFieldArray({
//         control: form.control,
//         name: "clientLocations",
//     });

//     const handleSearchByRuc = async(ruc: string) =>
//     {
//         setLoading(true);
//         const [data, error] = await SearchClientByRuc(ruc);
//         if (error !== null)
//         {
//             console.error("Error searching client by RUC:", error);
//         }

//         // Actualiza los campos del formulario con los datos obtenidos
//         setValue("razonSocial", data.razonSocial ?? "");
//         setValue("name", data.name ?? "");
//         setValue("fiscalAddress", data.fiscalAddress ?? "");
//         setValue("businessType", data.businessType ?? "");

//         setLoading(false);
//     };

//     const onSubmit = async(input: CreateClientSchema) =>
//     {
//         const [, error] = await toastWrapper(RegisterClient(input), {
//             loading: "Cargando...",
//             success: "Cliente registrado exitosamente!",
//         });
//         if (error !== null)
//         {
//             return;
//         }

//         reset();
//     };

//     const handleGoBack = () =>
//     {
//         router.back();
//     };

//     return (

//         <div className="mt-5">
//             <Button variant="outline" onClick={handleGoBack} className="flex items-center gap-2 mb-5">
//                 <ArrowLeft className="h-4 w-4" />
//                 Volver
//             </Button>

//             <Form {...form}>
//                 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
//                     <div className="mx-4 grid gap-3">

//                         {/* Tipo de documento */}
//                         <FormField
//                             control={form.control}
//                             name="typeDocument"
//                             render={({ field }) => (
//                                 <FormItem className="truncate">
//                                     <FormLabel className="text-xs md:text-sm">
//                                         Tipo de documento
//                                     </FormLabel>
//                                     <Select onValueChange={(value) =>
//                                     {
//                                         field.onChange(value);
//                                         setTypeDocument(value);
//                                     }}
//                                     >
//                                         <FormControl className="mb-0">
//                                             <SelectTrigger>
//                                                 <SelectValue placeholder="Seleccione el tipo de documento" />
//                                             </SelectTrigger>
//                                         </FormControl>
//                                         <SelectContent>
//                                             <SelectItem value="ruc">
//                                                 RUC
//                                             </SelectItem>
//                                             <SelectItem value="dni">
//                                                 DNI
//                                             </SelectItem>
//                                         </SelectContent>
//                                     </Select>
//                                 </FormItem>
//                             )}
//                         />

//                         {/* Campos condicionales */}
//                         {typeDocument === "ruc" && (
//                             <>
//                                 <FormField
//                                     control={form.control}
//                                     name="typeDocumentValue"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel className="text-xs md:text-sm">
//                                                 RUC
//                                             </FormLabel>
//                                             <FormControl>
//                                                 <div className="flex gap-2">
//                                                     <Input placeholder="Ingrese el RUC" {...field} />
//                                                     <Button type="button" className="px-3" onClick={() => handleSearchByRuc(field.value)} disabled={loading}>
//                                                         {loading ? <Loader className="animate-spin" /> : <Search />}
//                                                     </Button>
//                                                 </div>
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />
//                                 <FormField
//                                     control={form.control}
//                                     name="razonSocial"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel className="text-xs md:text-sm">
//                                                 Razón Social
//                                             </FormLabel>
//                                             <FormControl>
//                                                 <Input placeholder="Ingrese la razón social" {...field} />
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />
//                                 {/* Giro del negocio */}
//                                 <FormField
//                                     control={form.control}
//                                     name="businessType"
//                                     render={({ field }) => (
//                                         <FormItem className="truncate">
//                                             <FormLabel className="text-xs md:text-sm">
//                                                 Giro del Negocio
//                                             </FormLabel>
//                                             <FormControl>
//                                                 <Input placeholder="Giro del Negocio" {...field} />
//                                             </FormControl>
//                                         </FormItem>
//                                     )}
//                                 />
//                                 <FormField
//                                     control={form.control}
//                                     name="name"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel className="text-xs md:text-sm">
//                                                 Nombre Comercial
//                                             </FormLabel>
//                                             <FormControl>
//                                                 <Input placeholder="Ingrese el nombre comercial" {...field} />
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />
//                                 <FormField
//                                     control={form.control}
//                                     name="contactName"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel className="text-xs md:text-sm">
//                                                 Nombre de Contacto
//                                             </FormLabel>
//                                             <FormControl>
//                                                 <Input placeholder="Ingrese el nombre de contacto" {...field} />
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />
//                             </>
//                         )}

//                         {typeDocument === "dni" && (
//                             <>
//                                 {/* DNI */}
//                                 <FormField
//                                     control={form.control}
//                                     name="typeDocumentValue"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel className="text-xs md:text-sm">
//                                                 DNI
//                                             </FormLabel>
//                                             <FormControl>
//                                                 <Input placeholder="Ingrese el DNI" {...field} />
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />

//                                 {/* Nombre */}
//                                 <FormField
//                                     control={form.control}
//                                     name="name"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel className="text-xs md:text-sm">
//                                                 Nombres y Apellidos
//                                             </FormLabel>
//                                             <FormControl>
//                                                 <Input placeholder="Ingrese los nombres y apellidos" {...field} />
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />
//                             </>

//                         )}

//                         {/* Dirección Principal */}
//                         <FormField
//                             control={form.control}
//                             name="fiscalAddress"
//                             render={({ field }) => (
//                                 <FormItem>
//                                     <FormLabel className="text-xs md:text-sm">
//                                         Dirección
//                                     </FormLabel>
//                                     <FormControl>
//                                         <Input placeholder="Dirección" {...field} />
//                                     </FormControl>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />

//                         {/* Campo de Teléfono */}
//                         <FormField
//                             control={form.control}
//                             name="phoneNumber"
//                             render={({ field }) => (
//                                 <FormItem>
//                                     <FormLabel className="text-xs md:text-sm" htmlFor="phoneNumber">
//                                         Teléfono
//                                     </FormLabel>
//                                     <FormControl>
//                                         <Input
//                                             id="phone"
//                                             placeholder="Ingrese el número de teléfono"
//                                             {...field}
//                                         />
//                                     </FormControl>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />

//                         {/* Campo de Correo Electrónico */}
//                         <FormField
//                             control={form.control}
//                             name="email"
//                             render={({ field }) => (
//                                 <FormItem>
//                                     <FormLabel className="text-xs md:text-sm" htmlFor="email">
//                                         Correo Electrónico
//                                     </FormLabel>
//                                     <FormControl>
//                                         <Input
//                                             id="email"
//                                             placeholder="Ingrese el correo electrónico"
//                                             {...field}
//                                         />
//                                     </FormControl>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />
//                         <div className="space-y-2">
//                             <div className="flex items-center justify-between">
//                                 <Button type="button" variant="outline" size="sm" className="mt-2 w-full" onClick={() => append({ address: "" })}>
//                                     <Plus className="h-4 w-4 mr-2" />
//                                     Agregar dirección
//                                 </Button>
//                             </div>

//                             {fields.map((field, index) => (
//                                 <div key={field.id} className="flex gap-2">
//                                     {index > 0 && (
//                                         <>
//                                             <FormField
//                                                 control={form.control}
//                                                 name={`clientLocations.${index}.address`}
//                                                 render={({ field }) => (
//                                                     <FormItem className="flex-1">
//                                                         <FormControl>
//                                                             <Input placeholder={`Dirección secundaria ${index}`} {...field} />
//                                                         </FormControl>
//                                                         <FormMessage />
//                                                     </FormItem>
//                                                 )}
//                                             />
//                                             <Button type="button" variant="ghost" size="icon" className="h-10 w-10" onClick={() => remove(index)}>
//                                                 <Trash2 className="h-4 w-4" />
//                                             </Button>

//                                         </>
//                                     )}
//                                 </div>
//                             ))}
//                         </div>
//                     </div>

//                     <SheetFooter>
//                         <Button type="submit">
//                             Guardar
//                         </Button>
//                     </SheetFooter>
//                 </form>
//             </Form>
//         </div>
//     );
// };

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader, Plus, Search, Trash2 } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SheetFooter } from "@/components/ui/sheet";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema, type CreateClientSchema } from "../schemas";
import { RegisterClient, SearchClientByRuc } from "../actions";
import { toastWrapper } from "@/types/toasts";
import { useRouter } from "next/navigation";

export const CreateClient = () =>
{
    const [typeDocument, setTypeDocument] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const form = useForm<CreateClientSchema>({
        resolver: zodResolver(clientSchema),
        defaultValues: {
            typeDocument: "",
            typeDocumentValue: "",
            razonSocial: "",
            businessType: "",
            name: "",
            fiscalAddress: "",
            email: "",
            contactName: "",
            clientLocations: [
                {
                    address: "",
                },
            ],
            phoneNumber: "",
        },
    });

    const { reset, setValue } = form;

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "clientLocations",
    });

    const handleSearchByRuc = async(ruc: string) =>
    {
        setLoading(true);
        const [data, error] = await SearchClientByRuc(ruc);
        if (error !== null)
        {
            console.error("Error searching client by RUC:", error);
        }

        // Actualiza los campos del formulario con los datos obtenidos
        setValue("razonSocial", data.razonSocial ?? "");
        setValue("name", data.name ?? "");
        setValue("fiscalAddress", data.fiscalAddress ?? "");
        setValue("businessType", data.businessType ?? "");

        setLoading(false);
    };

    const onSubmit = async(input: CreateClientSchema) =>
    {
        const [, error] = await toastWrapper(RegisterClient(input), {
            loading: "Cargando...",
            success: "Cliente registrado exitosamente!",
        });
        if (error !== null)
        {
            return;
        }

        reset();
        router.push("/clients");
    };

    const handleGoBack = () =>
    {
        router.back();
    };

    return (
        <div className="mt-5">
            <Button variant="outline" onClick={handleGoBack} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver
            </Button>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                    <div className="mx-4 grid gap-3">
                        <h3 className="text-lg font-bold mt-4">
                            Información del Cliente
                        </h3>

                        {/* Tipo de documento */}
                        <FormField
                            control={form.control}
                            name="typeDocument"
                            render={({ field }) => (
                                <FormItem className="truncate">
                                    <FormLabel className="text-base">
                                        Tipo de documento
                                    </FormLabel>
                                    <Select
                                        onValueChange={(value) =>
                                        {
                                            field.onChange(value);
                                            setTypeDocument(value);
                                        }}
                                        value={field.value}
                                    >
                                        <FormControl className="mb-0">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione el tipo de documento" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="ruc">
                                                RUC
                                            </SelectItem>
                                            <SelectItem value="dni">
                                                DNI
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Campos condicionales */}
                        {typeDocument === "ruc" && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="typeDocumentValue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base">
                                                RUC
                                            </FormLabel>
                                            <FormControl>
                                                <div className="flex gap-2">
                                                    <Input placeholder="Ingrese el RUC" {...field} />
                                                    <Button
                                                        type="button"
                                                        className="px-3"
                                                        onClick={() => handleSearchByRuc(field.value)}
                                                        disabled={loading || !field.value}
                                                    >
                                                        {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="razonSocial"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base">
                                                Razón Social
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ingrese la razón social" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* Giro del negocio */}
                                <FormField
                                    control={form.control}
                                    name="businessType"
                                    render={({ field }) => (
                                        <FormItem className="truncate">
                                            <FormLabel className="text-base">
                                                Giro del Negocio
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Giro del Negocio" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base">
                                                Nombre Comercial
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ingrese el nombre comercial" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="contactName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base">
                                                Nombre de Contacto
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ingrese el nombre de contacto" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}

                        {typeDocument === "dni" && (
                            <>
                                {/* DNI */}
                                <FormField
                                    control={form.control}
                                    name="typeDocumentValue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base">
                                                DNI
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ingrese el DNI" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Nombre */}
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base">
                                                Nombres y Apellidos
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ingrese los nombres y apellidos" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}

                        <hr />

                        <h3 className="text-lg font-bold mt-4">
                            Contacto y Dirección
                        </h3>

                        {/* Dirección Principal */}
                        <FormField
                            control={form.control}
                            name="fiscalAddress"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base">
                                        Dirección Principal
                                    </FormLabel>
                                    <FormDescription>
                                        Dirección fiscal o principal del cliente
                                    </FormDescription>
                                    <FormControl>
                                        <Input placeholder="Av. / Jr. / Calle Nro. Lt." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            {/* Campo de Teléfono */}
                            <FormField
                                control={form.control}
                                name="phoneNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base">
                                            Teléfono
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ingrese el número de teléfono" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Campo de Correo Electrónico */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base">
                                            Correo Electrónico
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ingrese el correo electrónico" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <hr />

                        <h3 className="text-lg font-bold mt-4">
                            Direcciones Adicionales
                        </h3>

                        <FormDescription>
                            Agregue direcciones adicionales donde el cliente pueda recibir servicios
                        </FormDescription>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => append({ address: "" })}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar dirección
                        </Button>

                        {fields.map((field, index) => (
                            <div key={field.id}>
                                {index > 0 && (
                                    <div className="flex gap-2">
                                        <FormField
                                            control={form.control}
                                            name={`clientLocations.${index}.address`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl>
                                                        <Input placeholder={`Dirección adicional ${index}`} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-10 w-10 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                            onClick={() => remove(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <SheetFooter>
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                            Guardar
                        </Button>
                    </SheetFooter>
                </form>
            </Form>
        </div>
    );
};

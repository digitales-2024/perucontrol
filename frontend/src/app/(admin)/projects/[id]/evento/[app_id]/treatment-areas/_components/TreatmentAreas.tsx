// "use client";

// import { useForm, useFieldArray } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//     Form,
//     FormField,
//     FormItem,
//     FormLabel,
//     FormControl,
//     FormMessage,
// } from "@/components/ui/form";
// import { PlusCircle, Trash2 } from "lucide-react";
// import { Separator } from "@/components/ui/separator";
// import { Badge } from "@/components/ui/badge";
// import { components } from "@/types/api";
// import {
//     TreatmentProductFormValues,
//     treatmentAreaSchema,
//     TreatmentAreaFormValues,
// } from "@/app/(admin)/projects/schemas";
// import { toastWrapper } from "@/types/toasts";
// import { CreateTreatmentProduct } from "@/app/(admin)/projects/actions";

// export function TreatmentAreaForm({
//     appointmentId,
//     treatmentProducts,
// }: {
//   appointmentId: string;
//   treatmentProducts: Array<components["schemas"]["TreatmentProductDTO"]>;
// })
// {
//     // inicializa el form con los datos existentes o un objeto vacío
//     const form = useForm<TreatmentAreaFormValues>({
//         resolver: zodResolver(treatmentAreaSchema),
//         defaultValues: {
//             products: treatmentProducts.length > 0
//                 ? treatmentProducts.map((tp) => ({
//                     id: tp.id,
//                     productId: tp.product.id,
//                     productAmountSolventId: tp.productAmountSolventId,
//                     equipmentUsed: tp.equipmentUsed,
//                     appliedTechnique: tp.appliedTechnique,
//                     appliedService: tp.appliedService,
//                     appliedTime: tp.appliedTime,
//                 }))
//                 : [{
//                     id: null,
//                     productId: "",
//                     productAmountSolventId: "",
//                     equipmentUsed: null,
//                     appliedTechnique: null,
//                     appliedService: null,
//                     appliedTime: null,
//                 }],
//         },
//     });

//     const { fields, append, remove } = useFieldArray({
//         name: "products",
//         control: form.control,
//     });

//     const onSubmit = async(data: TreatmentProductFormValues) =>
//     {
//     // envía TODO el array
//         const [, error] = await toastWrapper(
//             CreateTreatmentProduct(appointmentId, data.products),
//             {
//                 loading: "Guardando productos...",
//                 success: "Productos guardados",
//                 error: (e) => `Error: ${e.message}`,
//             },
//         );
//         if (error !== null)
//         {
//             return;
//         }
//     };

//     return (
//         <Card className="mt-5 border shadow-sm">
//             <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 py-4 rounded-t-lg">
//                 <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
//                     <PlusCircle className="h-5 w-5" />
//                     Áreas de Tratamiento
//                 </CardTitle>
//             </CardHeader>
//             <CardContent className="p-6">
//                 <Form {...form}>
//                     <form
//                         onSubmit={form.handleSubmit(onSubmit)}
//                         className="space-y-6"
//                     >
//                         {fields.map((f, idx) => (
//                             <Card
//                                 key={f.id}
//                                 className="mb-6 p-6 border shadow-sm relative"
//                             >
//                                 <div className="absolute -top-3 -left-3">
//                                     <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
//                                         Área de Tratamiento #
//                                         {idx + 1}
//                                     </Badge>
//                                 </div>
//                                 <div className="flex flex-wrap justify-start md:justify-end gap-2 mb-4">
//                                     <Button
//                                         type="button"
//                                         variant="outline"
//                                         size="sm"
//                                         onClick={() => append({
//                                             id: null,
//                                             productId: "",
//                                             productAmountSolventId: "",
//                                             equipmentUsed: null,
//                                             appliedTechnique: null,
//                                             appliedService: null,
//                                             appliedTime: null,
//                                         })
//                                         }
//                                     >
//                                         <PlusCircle className="h-4 w-4" />
//                                         Agregar
//                                     </Button>
//                                     {fields.length > 1 && (
//                                         <Button
//                                             type="button"
//                                             variant="destructive"
//                                             size="sm"
//                                             onClick={() => remove(idx)}
//                                             className="gap-1"
//                                         >
//                                             <Trash2 className="h-4 w-4" />
//                                             Eliminar
//                                         </Button>
//                                     )}
//                                 </div>

//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                     {/* Equipo Utilizado */}
//                                     <FormField
//                                         name={`products.${idx}.equipmentUsed`}
//                                         control={form.control}
//                                         render={({ field }) => (
//                                             <FormItem>
//                                                 <FormLabel>
//                                                     Equipo Utilizado
//                                                 </FormLabel>
//                                                 <FormControl>
//                                                     <Input {...field} placeholder="Pulverizador" value={field.value ?? ""} />
//                                                 </FormControl>
//                                                 <FormMessage />
//                                             </FormItem>
//                                         )}
//                                     />

//                                     {/* Técnica Aplicada */}
//                                     <FormField
//                                         name={`products.${idx}.appliedTechnique`}
//                                         control={form.control}
//                                         render={({ field }) => (
//                                             <FormItem>
//                                                 <FormLabel>
//                                                     Técnica Aplicada
//                                                 </FormLabel>
//                                                 <FormControl>
//                                                     <Input {...field} placeholder="Ej: Nebulización" value={field.value ?? ""} />
//                                                 </FormControl>
//                                                 <FormMessage />
//                                             </FormItem>
//                                         )}
//                                     />

//                                     {/* Servicio Aplicado */}
//                                     <FormField
//                                         name={`products.${idx}.appliedService`}
//                                         control={form.control}
//                                         render={({ field }) => (
//                                             <FormItem>
//                                                 <FormLabel>
//                                                     Servicio Aplicado
//                                                 </FormLabel>
//                                                 <FormControl>
//                                                     <Input {...field} placeholder="Ej: Desinfección" value={field.value ?? ""} />
//                                                 </FormControl>
//                                                 <FormMessage />
//                                             </FormItem>
//                                         )}
//                                     />

//                                     {/* Tiempo Aplicado */}
//                                     <FormField
//                                         name={`products.${idx}.appliedTime`}
//                                         control={form.control}
//                                         render={({ field }) => (
//                                             <FormItem>
//                                                 <FormLabel>
//                                                     Tiempo Aplicado
//                                                 </FormLabel>
//                                                 <FormControl>
//                                                     <Input {...field} placeholder="14:40" value={field.value ?? ""} />
//                                                 </FormControl>
//                                                 <FormMessage />
//                                             </FormItem>
//                                         )}
//                                     />
//                                 </div>
//                             </Card>
//                         ))}

//                         <Separator />

//                         <div className="flex flex-wrap gap-2 justify-between">
//                             <Button
//                                 type="button"
//                                 variant="outline"
//                                 onClick={() => append({
//                                     id: null,
//                                     productId: "",
//                                     productAmountSolventId: "",
//                                     equipmentUsed: null,
//                                     appliedTechnique: null,
//                                     appliedService: null,
//                                     appliedTime: null,
//                                 })
//                                 }
//                             >
//                                 <PlusCircle />
//                                 Agregar otro producto
//                             </Button>
//                             <Button
//                                 type="submit"
//                                 className="bg-blue-600 hover:bg-blue-700"
//                             >
//                                 Guardar Registro
//                             </Button>
//                         </div>
//                     </form>
//                 </Form>
//             </CardContent>
//         </Card>
//     );
// }

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { RemoveProject } from "../actions";
import { Project } from "../types";
import { toast } from "sonner";

interface DeleteClientProps {
open: boolean;
onOpenChange: (open: boolean) => void;
project: Project,
showTrigger?: boolean;
}

export function DeleteProject({open, onOpenChange, project, showTrigger = true}: DeleteClientProps)
{
    const onDeleteQuotationHandler = async() =>
    {
        try
        {
            const result = await RemoveProject(project.id!);
            const error = result[1];
            if (error)
            {
                throw new Error(error.message);
            }
            toast.success("Proyecto eliminado exitosamente!");
        }
        catch (error: unknown)
        {
            if (error instanceof Error)
            {
                toast.error(error.message || "Error al eliminar el proyecto");
            }
            else
            {
                toast.error("Error al eliminar el proyecto");
            }
        }
        finally
        {
            onOpenChange(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            { showTrigger ? (
                <AlertDialogTrigger asChild>
                    <Button variant="outline">
                      Eliminar
                    </Button>
                </AlertDialogTrigger>
            ) : null }
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                      ¿Esta absolutamente seguro?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Esto eliminará permanentemente los datos del proyecto.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                        aria-label="Delete selected rows"
                        onClick={onDeleteQuotationHandler}
                    >
                    Continuar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

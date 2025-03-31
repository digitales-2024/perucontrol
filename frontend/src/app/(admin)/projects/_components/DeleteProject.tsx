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
import { toastWrapper } from "@/types/toasts";
import { Project } from "../types";

interface DeleteClientProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project: Project,
    showTrigger?: boolean;
}

export function DeleteProject({ open, onOpenChange, project, showTrigger = true }: DeleteClientProps)
{
    const onDeleteQuotationHandler = async() =>
    {
        const [, err] = await toastWrapper(RemoveProject(project.id!), {
            loading: "Eliminando proyecto...",
            success: "Proyecto eliminado exitosamente!",
        });
        if (err !== null)
        {
            return;
        }
        onOpenChange(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            {showTrigger ? (
                <AlertDialogTrigger asChild>
                    <Button variant="outline">
                        Eliminar
                    </Button>
                </AlertDialogTrigger>
            ) : null}
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

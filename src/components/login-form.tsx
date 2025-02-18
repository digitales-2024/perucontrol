import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"form">)
{
    return (
        <form className={cn("flex flex-col gap-6", className)} {...props}>
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
                    <Label htmlFor="email">
                        Correo electrónico
                    </Label>
                    <Input id="email" type="email" placeholder="administracion@perucontrol.com" required />
                </div>
                <div className="grid gap-2">
                    <div className="flex items-center">
                        <Label htmlFor="password">
                            Contraseña
                        </Label>
                        <a
                            href="#"
                            className="ml-auto text-sm underline-offset-4 hover:underline"
                        >
                            ¿Olvidaste tu contraseña?
                        </a>
                    </div>
                    <Input id="password" type="password" required />
                </div>
                <Button type="submit" className="w-full">
                    Iniciar sesión
                </Button>
            </div>
            <div className="h-16" />
        </form>
    );
}

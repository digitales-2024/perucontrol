import { LoginForm } from "@/components/login-form";

export default async function LoginPage()
{
    return (
        <div className="grid min-h-svh lg:grid-cols-[4fr_6fr]">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <LoginForm />
                    </div>
                </div>
            </div>
            <div className="relative hidden bg-muted lg:block">
                <img
                    src="/portada.webp"
                    alt="Portada"
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale opacity-50"
                />
            </div>
        </div>
    );
}


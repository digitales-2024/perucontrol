import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";

export default function ErrorPage()
{
    const router = useRouter();

    const handleGoBack = () =>
    {
        router.back();
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold text-red-600">
              Error
            </h1>
            <p className="mt-4 text-lg text-gray-700">
              Ha ocurrido un error. Por favor, inténtelo de nuevo más tarde.
            </p>
            <Button onClick={handleGoBack} className="mt-6">
                Volver
            </Button>
        </div>
    );
}

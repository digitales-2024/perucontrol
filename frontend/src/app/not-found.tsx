import { Ban } from "lucide-react";
import Link from "next/link";
import AdminLayout from "./(admin)/layout";

export default function NotFoundRoot()
{
    return (
        <div>
            <AdminLayout>
                <div className="grid items-center justify-center text-center">
                    <div className="py-12">
                        <Ban className="inline-block opacity-75 mb-6" size={96} />
                        <h1 className="font-bold text-3xl mb-2">
                            Página no encontrada
                        </h1>
                        <p className="mb-6 text-lg text-muted-foreground">
                            Lo sentimos, la página que buscas no existe o fue movida.
                        </p>
                        <Link
                            href="/"
                            className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                            Volver al inicio
                        </Link>
                    </div>
                </div>
            </AdminLayout>
        </div>
    );
}

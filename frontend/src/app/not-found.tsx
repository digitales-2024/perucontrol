import { Construction } from "lucide-react";
import AdminLayout from "./(admin)/layout";

export default function NotFoundRoot()
{
    // FIXME: remove when finishing all pages
    return (
        <div>
            <AdminLayout>
                <div className="grid items-center justify-center">
                    <h1 className="font-bold text-2xl">
                        En construccion (404)
                    </h1>
                    <p>
                        Esta página aun no está disponible
                    </p>
                    <div className="text-center py-16">
                        <Construction className="inline-block opacity-75" size={128} />
                    </div>
                </div>
            </AdminLayout>
        </div>
    );
}

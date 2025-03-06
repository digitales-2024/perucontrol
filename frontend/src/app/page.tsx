import { Shell } from "@/components/common/Shell";
import AdminLayout from "./(admin)/layout";
import { HeaderPage } from "@/components/common/HeaderPage";
import { Construction } from "lucide-react";

export default function Home()
{
    return (
        <AdminLayout>
            <Shell>
                <HeaderPage title="Dashbard" description="Sistema de gestión de PeruControl - en desarrollo" />
            </Shell>
            <div className="grid items-center justify-center">
                <p>
                    Esta página aun no está disponible
                </p>
                <div className="text-center py-16">
                    <Construction className="inline-block opacity-75" size={128} />
                </div>
            </div>
        </AdminLayout>
    );
}

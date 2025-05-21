import AdminLayout from "./(admin)/layout";
import { HeaderPage } from "@/components/common/HeaderPage";
import CalendarDemo from "./root/CalendarDemo";
import { Dashboard } from "./root/Dashboard";
import { backend, wrapper } from "@/types/backend";

export default async function Home()
{
    const [data, error] = await wrapper((auth) => backend.GET("/api/Stats", auth));
    if (!!error)
    {
        console.log("Error getting stats", error);
        throw error;
    }

    return (
        <AdminLayout>
            <HeaderPage title="Inicio" description="Sistema de gestión de PeruControl" />

            <div className="max-w-[50rem] mx-auto">
                <Dashboard data={data} />
                <hr />

                <CalendarDemo />
            </div>
        </AdminLayout>
    );
}

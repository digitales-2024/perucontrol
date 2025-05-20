import AdminLayout from "./(admin)/layout";
import { HeaderPage } from "@/components/common/HeaderPage";
import CalendarDemo from "./root/CalendarDemo";
import { Dashboard } from "./root/Dashboard";

export default function Home()
{
    return (
        <AdminLayout>
            <HeaderPage title="Inicio" description="Sistema de gestión de PeruControl" />

            <div className="max-w-[50rem] mx-auto">
                <Dashboard />
                <hr />

                <CalendarDemo />
            </div>
        </AdminLayout>
    );
}

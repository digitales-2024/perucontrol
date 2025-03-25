import { Shell } from "@/components/common/Shell";
import AdminLayout from "./(admin)/layout";
import { HeaderPage } from "@/components/common/HeaderPage";
import CalendarDemo from "./components/CalendarDemo";

export default function Home()
{
    return (
        <AdminLayout>
            <Shell>
                <HeaderPage title="Inicio" description="Sistema de gestión de PeruControl" />
            </Shell>

            <CalendarDemo />
        </AdminLayout>
    );
}

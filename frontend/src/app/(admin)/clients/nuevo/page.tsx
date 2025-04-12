import { HeaderPage } from "@/components/common/HeaderPage";
import { CreateClient } from "./_CreateClient";

export default async function CotizacionPage()
{
    return (
        <>
            <HeaderPage title="Crear cliente" description="Crea un nuevo cliente" />
            <CreateClient />
        </>
    );
}

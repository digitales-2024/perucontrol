import { Button } from "@/components/ui/button";

export default async function CotizacionPage()
{
    return (
        <div>
            <h1 className="font-bold text-2xl">
                Cotizaciones
            </h1>
            <p className="text-sm opacity-70">
                Gestiona las cotizaciones de la empresa
            </p>

            <Button>
                Nueva cotización
            </Button>
        </div>
    );
}

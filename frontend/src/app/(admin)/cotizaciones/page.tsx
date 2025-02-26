import { CreateCotizacion } from "./_create";

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

            <div>
                <CreateCotizacion />
            </div>

        </div>
    );
}

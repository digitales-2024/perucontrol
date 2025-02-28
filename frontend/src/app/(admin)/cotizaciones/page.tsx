import { backend, wrapper } from "@/types/backend";
import { CreateCotizacion } from "./_create";

export default async function CotizacionPage()
{
    // get all terms and conditions
    const [data, err] = await wrapper((auth) => backend.GET("/api/TermsAndConditions", auth));
    if (err)
    {
        console.error(`error :c ${err.message}`);
        throw err;
    }

    return (
        <div>
            <h1 className="font-bold text-2xl">
                Cotizaciones
            </h1>
            <p className="text-sm opacity-70">
                Gestiona las cotizaciones de la empresa
            </p>

            <div>
                <CreateCotizacion termsAndConditions={data} />
            </div>

        </div>
    );
}

namespace PeruControl.Controllers;

public class TreatmentAreaModule : IModule
{
    public IServiceCollection SetupModule(IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<TreatmentAreaService>();
        return services;
    }
}


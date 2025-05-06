namespace PeruControl.Controllers;

public class TreatmentProductModule : IModule
{
    public IServiceCollection SetupModule(IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<TreatmentProductService>();
        return services;
    }
}

namespace PeruControl.Controllers;

public class QuotationModule : IModule
{
    public IServiceCollection SetupModule(IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<QuotationService>();
        return services;
    }
}

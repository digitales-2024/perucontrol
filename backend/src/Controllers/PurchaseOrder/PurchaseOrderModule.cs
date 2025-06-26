namespace PeruControl.Controllers;

public class PurchaseOrderModule : IModule
{
    public IServiceCollection SetupModule(IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<PurchaseOrderService>();
        return services;
    }
}

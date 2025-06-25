using Microsoft.Extensions.DependencyInjection;

namespace PeruControl.Controllers;

public class PurchaseOrderModule : IModule
{
    public IServiceCollection SetupModule(IServiceCollection services, IConfiguration configuration)
    {
        return services;
    }
}

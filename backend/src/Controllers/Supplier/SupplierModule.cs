namespace PeruControl.Controllers;

public class SupplierModule : IModule
{
    public IServiceCollection SetupModule(IServiceCollection services, IConfiguration configuration)
    {
        return services;
    }
}
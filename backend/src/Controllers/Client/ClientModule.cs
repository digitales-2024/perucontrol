namespace PeruControl.Controllers;

public class ClientModule : IModule
{
    public IServiceCollection SetupModule(IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<ClientService>();
        return services;
    }
}

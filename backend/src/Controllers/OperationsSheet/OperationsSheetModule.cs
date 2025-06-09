namespace PeruControl.Controllers;

public class OperationSheetModule : IModule
{
    public IServiceCollection SetupModule(IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<OperationSheetService>();
        return services;
    }
}


namespace PeruControl.Controllers;

public class ProjectModule : IModule
{
    public IServiceCollection SetupModule(IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<ProjectService>();

        return services;
    }
}

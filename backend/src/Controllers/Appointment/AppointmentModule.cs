namespace PeruControl.Controllers;

public class AppointmentModule : IModule
{
    public IServiceCollection SetupModule(IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<AppointmentService>();
        return services;
    }
}

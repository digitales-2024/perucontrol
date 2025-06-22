using Microsoft.Extensions.DependencyInjection;
using PeruControl.Application.UseCases.Clients.GetAllActiveClients;

namespace PeruControl.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Register Use Cases
        services.AddScoped<GetAllActiveClientsUseCase>();

        return services;
    }
}

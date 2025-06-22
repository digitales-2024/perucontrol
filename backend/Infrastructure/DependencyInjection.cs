using Microsoft.Extensions.DependencyInjection;
using PeruControl.Domain.Repositories;
using PeruControl.Infrastructure.Repositories;

namespace PeruControl.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        // Register repositories
        services.AddScoped<IClientRepository, ClientRepository>();

        return services;
    }
}

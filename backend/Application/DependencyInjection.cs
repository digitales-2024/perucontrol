using Microsoft.Extensions.DependencyInjection;
using PeruControl.Application.UseCases.Clients;
using PeruControl.Application.UseCases.Clients.CreateClient;
using PeruControl.Application.UseCases.Clients.GetAllActiveClients;
using PeruControl.Application.UseCases.Clients.GetClientById;
using PeruControl.Application.UseCases.Clients.UpdateClientInformation;

namespace PeruControl.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Register Use Cases

        //
        // Client use cases
        //
        services.AddScoped<GetAllActiveClientsUseCase>();
        services.AddScoped<GetClientByIdUseCase>();
        services.AddScoped<CreateClientUseCase>();
        services.AddScoped<UpdateClientInformationUseCase>();
        services.AddScoped<DeactivateClientUseCase>();
        services.AddScoped<ReactivateClientUseCase>();

        return services;
    }
}

using Microsoft.Extensions.DependencyInjection;
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
        services.AddScoped<GetAllActiveClientsUseCase>();
        services.AddScoped<GetClientByIdUseCase>();
        services.AddScoped<CreateClientUseCase>();
        services.AddScoped<UpdateClientInformationUseCase>();

        return services;
    }
}

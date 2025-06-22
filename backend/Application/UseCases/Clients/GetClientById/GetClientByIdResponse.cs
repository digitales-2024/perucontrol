using PeruControl.Application.UseCases.Clients.GetAllActiveClients;

namespace PeruControl.Application.UseCases.Clients.GetClientById;

public class GetClientByIdResponse
{
    public ClientDto Client { get; set; } = null!;
}

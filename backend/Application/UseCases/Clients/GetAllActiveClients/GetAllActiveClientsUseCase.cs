using PeruControl.Domain.Common;
using PeruControl.Domain.Entities;
using PeruControl.Domain.Repositories;

namespace PeruControl.Application.UseCases.Clients.GetAllActiveClients;

public class GetAllActiveClientsUseCase
{
    private readonly IClientRepository _clientRepository;

    public GetAllActiveClientsUseCase(IClientRepository clientRepository)
    {
        _clientRepository = clientRepository;
    }

    public async Task<Result<GetAllActiveClientsResponse>> ExecuteAsync(
        GetAllActiveClientsRequest request,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var clientsResult = await _clientRepository.GetActiveAsync(cancellationToken);

            if (clientsResult.IsFailure)
                return Result.Failure<GetAllActiveClientsResponse>(clientsResult.Error);

            var clients = clientsResult.Value;

            // Map domain entities to response DTOs
            var clientDtos = clients
                .Select(client => new ClientDto
                {
                    Id = client.Id,
                    ClientNumber = client.ClientNumber,
                    DocumentType = client.DocumentInfo.Type,
                    DocumentValue = client.DocumentInfo.Value,
                    Name = client.Name,
                    RazonSocial = client.RazonSocial,
                    BusinessType = client.BusinessType,
                    FiscalAddress = client.FiscalAddress.Value,
                    Email = client.Email.Value,
                    PhoneNumber = client.PhoneNumber.Value,
                    ContactName = client.ContactName,
                    Locations = client
                        .Locations.Select(location => new ClientLocationDto
                        {
                            Id = location.Id,
                            Address = location.Address.Value,
                        })
                        .ToList(),
                    CreatedAt = client.CreatedAt,
                    ModifiedAt = client.ModifiedAt,
                })
                .ToList();

            var response = new GetAllActiveClientsResponse
            {
                Clients = clientDtos,
                TotalCount = clientDtos.Count,
            };

            return Result.Success(response);
        }
        catch (Exception ex)
        {
            return Result.Failure<GetAllActiveClientsResponse>(
                $"Error retrieving active clients: {ex.Message}"
            );
        }
    }
}

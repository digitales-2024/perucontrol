using PeruControl.Application.UseCases.Clients.GetAllActiveClients;
using PeruControl.Domain.Common;
using PeruControl.Domain.Repositories;

namespace PeruControl.Application.UseCases.Clients.GetClientById;

public class GetClientByIdUseCase
{
    private readonly IClientRepository _clientRepository;

    public GetClientByIdUseCase(IClientRepository clientRepository)
    {
        _clientRepository = clientRepository;
    }

    public async Task<Result<GetClientByIdResponse>> ExecuteAsync(
        GetClientByIdRequest request,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var clientResult = await _clientRepository.GetByIdAsync(
                request.ClientId,
                cancellationToken
            );

            if (clientResult.IsFailure)
                return Result.Failure<GetClientByIdResponse>(clientResult.Error);

            var client = clientResult.Value!;

            var response = new GetClientByIdResponse
            {
                Client = new ClientDto
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
                    IsActive = client.IsActive,
                },
            };

            return Result.Success(response);
        }
        catch (Exception ex)
        {
            return Result.Failure<GetClientByIdResponse>($"Error retrieving client: {ex.Message}");
        }
    }
}

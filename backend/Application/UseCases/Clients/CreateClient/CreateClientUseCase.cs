using PeruControl.Domain.Common;
using PeruControl.Domain.Entities;
using PeruControl.Domain.Repositories;

namespace PeruControl.Application.UseCases.Clients.CreateClient;

public class CreateClientUseCase
{
    private readonly IClientRepository _clientRepository;

    public CreateClientUseCase(IClientRepository clientRepository)
    {
        _clientRepository = clientRepository;
    }

    public async Task<Result<CreateClientResponse>> ExecuteAsync(
        CreateClientRequest request,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            // Check for duplicate document
            var existingClientExists = await _clientRepository.ExistsByDocumentAsync(
                request.DocumentType,
                request.DocumentValue,
                cancellationToken
            );

            if (existingClientExists)
                return Result.Failure<CreateClientResponse>(
                    "Ya existe un cliente con el mismo Documento."
                );

            // Create client using domain factory
            var clientResult = Client.Create(
                request.DocumentType,
                request.DocumentValue,
                request.Name,
                request.FiscalAddress,
                request.Email,
                request.PhoneNumber,
                request.RazonSocial,
                request.BusinessType,
                request.ContactName
            );

            if (clientResult.IsFailure)
                return Result.Failure<CreateClientResponse>(clientResult.Error);

            var client = clientResult.Value!;

            // Add locations if provided
            if (request.Locations != null && request.Locations.Any())
            {
                foreach (var locationAddress in request.Locations)
                {
                    var addLocationResult = client.AddLocation(locationAddress);
                    if (addLocationResult.IsFailure)
                        return Result.Failure<CreateClientResponse>(addLocationResult.Error);
                }
            }

            // Save through repository
            _clientRepository.Add(client);
            await _clientRepository.SaveChangesAsync();

            var response = new CreateClientResponse
            {
                ClientId = client.Id,
                Message = "Cliente creado exitosamente",
            };

            return Result.Success(response);
        }
        catch (Exception ex)
        {
            return Result.Failure<CreateClientResponse>($"Error creating client: {ex.Message}");
        }
    }
}

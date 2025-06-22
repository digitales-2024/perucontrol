using PeruControl.Domain.Common;
using PeruControl.Domain.Entities;
using PeruControl.Domain.Repositories;
using PeruControl.Domain.ValueObjects;

namespace PeruControl.Application.UseCases.Clients.UpdateClientInformation;

public class UpdateClientInformationUseCase
{
    private readonly IClientRepository _clientRepository;

    public UpdateClientInformationUseCase(IClientRepository clientRepository)
    {
        _clientRepository = clientRepository;
    }

    public async Task<Result<Unit>> ExecuteAsync(
        UpdateClientInformationRequest request,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            // Load client with locations
            var clientResult = await _clientRepository.GetByIdWithLocationsAsync(
                request.ClientId,
                cancellationToken
            );

            if (clientResult.IsFailure)
                return Result.Failure<Unit>(clientResult.Error);

            var client = clientResult.Value!;

            // Update basic client information
            if (!string.IsNullOrWhiteSpace(request.Name))
                client.UpdateName(request.Name);

            if (!string.IsNullOrWhiteSpace(request.RazonSocial))
                client.UpdateRazonSocial(request.RazonSocial);

            if (!string.IsNullOrWhiteSpace(request.BusinessType))
                client.UpdateBusinessType(request.BusinessType);

            if (!string.IsNullOrWhiteSpace(request.ContactName))
                client.UpdateContactName(request.ContactName);

            // Update document info if provided
            if (
                !string.IsNullOrWhiteSpace(request.DocumentType)
                && !string.IsNullOrWhiteSpace(request.DocumentValue)
            )
            {
                var documentInfoResult = DocumentInfo.Create(
                    request.DocumentType,
                    request.DocumentValue
                );
                if (documentInfoResult.IsFailure)
                    return Result.Failure<Unit>(documentInfoResult.Error);

                client.UpdateDocumentInfo(documentInfoResult.Value);
            }

            // Update address if provided
            if (!string.IsNullOrWhiteSpace(request.FiscalAddress))
            {
                var addressResult = Address.Create(request.FiscalAddress);
                if (addressResult.IsFailure)
                    return Result.Failure<Unit>(addressResult.Error);

                client.UpdateFiscalAddress(addressResult.Value);
            }

            // Update email if provided
            if (!string.IsNullOrWhiteSpace(request.Email))
            {
                var emailResult = Email.Create(request.Email);
                if (emailResult.IsFailure)
                    return Result.Failure<Unit>(emailResult.Error);

                client.UpdateEmail(emailResult.Value);
            }

            // Update phone if provided
            if (!string.IsNullOrWhiteSpace(request.PhoneNumber))
            {
                var phoneResult = PhoneNumber.Create(request.PhoneNumber);
                if (phoneResult.IsFailure)
                    return Result.Failure<Unit>(phoneResult.Error);

                client.UpdatePhoneNumber(phoneResult.Value);
            }

            // Handle locations update - this is where the complexity was in the original controller
            if (request.Locations != null)
            {
                var locationsUpdateResult = await UpdateClientLocations(client, request.Locations);
                if (locationsUpdateResult.IsFailure)
                    return Result.Failure<Unit>(locationsUpdateResult.Error);
            }

            // Update the client through repository
            await _clientRepository.UpdateAsync(client, cancellationToken);

            return Result.Success(Unit.Value);
        }
        catch (Exception ex)
        {
            return Result.Failure<Unit>($"Error inesperado al actualizar cliente: {ex.Message}");
        }
    }

    private async Task<Result<Unit>> UpdateClientLocations(
        Client client,
        List<LocationUpdateDto> locations
    )
    {
        try
        {
            // Clear existing locations - let the domain handle this properly
            client.ClearLocations();

            // Add/update locations
            foreach (var locationDto in locations)
            {
                var addressResult = Address.Create(locationDto.Address);
                if (addressResult.IsFailure)
                    return Result.Failure<Unit>($"Invalid address: {addressResult.Error}");

                if (locationDto.Id.HasValue)
                {
                    // Try to update existing location or create new one with specified ID
                    var locationResult = ClientLocation.Create(
                        locationDto.Id.Value,
                        addressResult.Value,
                        client
                    );
                    if (locationResult.IsFailure)
                        return Result.Failure<Unit>(locationResult.Error);

                    client.AddOrUpdateLocation(locationResult.Value);
                }
                else
                {
                    // Create new location without specified ID
                    var locationResult = ClientLocation.Create(addressResult.Value, client);
                    if (locationResult.IsFailure)
                        return Result.Failure<Unit>(locationResult.Error);

                    client.AddOrUpdateLocation(locationResult.Value);
                }
            }

            return Result.Success(Unit.Value);
        }
        catch (Exception ex)
        {
            return Result.Failure<Unit>($"Error updating locations: {ex.Message}");
        }
    }
}

using PeruControl.Domain.Common;
using PeruControl.Domain.Entities;
using PeruControl.Domain.Repositories;
using PeruControl.Domain.ValueObjects;

namespace PeruControl.Application.UseCases.Clients.UpdateClientInformation;

public class UpdateClientInformationUseCase(IClientRepository _clientRepository)
{
    public async Task<Result<Unit>> ExecuteAsync(
        UpdateClientInformationRequest request,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            // Load client 
            var clientResult = await _clientRepository.GetByIdAsync(
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

            // Handle locations - let the repository deal with this mess
            if (request.Locations != null)
            {
                // Validate all locations first
                var validatedLocations = new List<(Guid? Id, Address Address)>();
                foreach (var locationDto in request.Locations)
                {
                    var addressResult = Address.Create(locationDto.Address);
                    if (addressResult.IsFailure)
                        return Result.Failure<Unit>($"Invalid address: {addressResult.Error}");

                    validatedLocations.Add((locationDto.Id, addressResult.Value));
                }

                // Update the client and locations atomically
                await _clientRepository.UpdateClientWithLocationsAsync(client, validatedLocations, cancellationToken);
            }
            else
            {
                // Just update the client without touching locations
                await _clientRepository.UpdateAsync(client, cancellationToken);
            }

            return Result.Success(Unit.Value);
        }
        catch (Exception ex)
        {
            return Result.Failure<Unit>($"Error inesperado al actualizar cliente: {ex.Message}");
        }
    }
}

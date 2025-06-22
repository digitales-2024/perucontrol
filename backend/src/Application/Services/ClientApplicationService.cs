using Microsoft.EntityFrameworkCore;
using PeruControl.Domain.Common;
using PeruControl.Domain.Repositories;
using PeruControl.Infrastructure.Model;
using DomainClient = PeruControl.Domain.Entities.Client;

namespace PeruControl.Application.Services;

public class ClientApplicationService
{
    private readonly IClientRepository _clientRepository;
    private readonly DatabaseContext _context;

    public ClientApplicationService(IClientRepository clientRepository, DatabaseContext context)
    {
        _clientRepository = clientRepository;
        _context = context;
    }

    public async Task<Result<DomainClient>> CreateClientAsync(
        string typeDocument,
        string typeDocumentValue,
        string name,
        string fiscalAddress,
        string email,
        string phoneNumber,
        string? razonSocial = null,
        string? businessType = null,
        string? contactName = null,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            // Check if client already exists
            var exists = await _clientRepository.ExistsByDocumentAsync(
                typeDocument,
                typeDocumentValue,
                cancellationToken
            );

            if (exists)
            {
                return Result.Failure<DomainClient>(
                    $"Client with document {typeDocument}-{typeDocumentValue} already exists"
                );
            }

            // Create domain entity using factory method
            var clientResult = DomainClient.Create(
                typeDocument,
                typeDocumentValue,
                name,
                fiscalAddress,
                email,
                phoneNumber,
                razonSocial,
                businessType,
                contactName
            );

            if (clientResult.IsFailure)
                return clientResult;

            // Add to repository and save
            _clientRepository.Add(clientResult.Value);
            await _context.SaveChangesAsync(cancellationToken);

            return Result.Success(clientResult.Value);
        }
        catch (Exception ex)
        {
            return Result.Failure<DomainClient>($"Error creating client: {ex.Message}");
        }
    }

    public async Task<Result<DomainClient>> GetClientByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        return await _clientRepository.GetByIdAsync(id, cancellationToken);
    }

    public async Task<Result<DomainClient>> GetClientByDocumentAsync(
        string typeDocument,
        string typeDocumentValue,
        CancellationToken cancellationToken = default
    )
    {
        return await _clientRepository.GetByDocumentAsync(
            typeDocument,
            typeDocumentValue,
            cancellationToken
        );
    }

    public async Task<Result<IReadOnlyList<DomainClient>>> GetAllActiveClientsAsync(
        CancellationToken cancellationToken = default
    )
    {
        return await _clientRepository.GetActiveAsync(cancellationToken);
    }

    public async Task<Result<DomainClient>> AddLocationToClientAsync(
        Guid clientId,
        string address,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var clientResult = await _clientRepository.GetByIdAsync(clientId, cancellationToken);
            if (clientResult.IsFailure)
                return clientResult;

            var client = clientResult.Value;
            var addLocationResult = client.AddLocation(address);
            if (addLocationResult.IsFailure)
                return Result.Failure<DomainClient>(addLocationResult.Error);

            _clientRepository.Update(client);
            await _context.SaveChangesAsync(cancellationToken);

            return Result.Success(client);
        }
        catch (Exception ex)
        {
            return Result.Failure<DomainClient>($"Error adding location: {ex.Message}");
        }
    }

    public async Task<Result> DeactivateClientAsync(
        Guid clientId,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var clientResult = await _clientRepository.GetByIdAsync(clientId, cancellationToken);
            if (clientResult.IsFailure)
                return Result.Failure(clientResult.Error);

            var client = clientResult.Value;
            _clientRepository.Delete(client);
            await _context.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure($"Error deactivating client: {ex.Message}");
        }
    }

    // Example of more complex operation with transaction
    public async Task<Result> TransferClientDataAsync(
        Guid fromClientId,
        Guid toClientId,
        CancellationToken cancellationToken = default
    )
    {
        using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var fromClientResult = await _clientRepository.GetByIdAsync(
                fromClientId,
                cancellationToken
            );
            if (fromClientResult.IsFailure)
                return Result.Failure(fromClientResult.Error);

            var toClientResult = await _clientRepository.GetByIdAsync(
                toClientId,
                cancellationToken
            );
            if (toClientResult.IsFailure)
                return Result.Failure(toClientResult.Error);

            // Do complex business operations here
            // Multiple repository calls, all within the same transaction

            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return Result.Success();
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            return Result.Failure($"Error transferring client data: {ex.Message}");
        }
    }
}

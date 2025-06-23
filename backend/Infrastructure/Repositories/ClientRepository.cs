using Microsoft.EntityFrameworkCore;
using PeruControl.Domain.Common;
using PeruControl.Domain.Repositories;
using PeruControl.Domain.ValueObjects;
using PeruControl.Infrastructure.Model;
using DomainClient = PeruControl.Domain.Entities.Client;
using DomainClientLocation = PeruControl.Domain.Entities.ClientLocation;

namespace PeruControl.Infrastructure.Repositories;

public class ClientRepository(DatabaseContext context) : IClientRepository
{
    private readonly DbSet<DomainClient> _clients = context.Clients;

    public async Task<Result<DomainClient>> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var client = await _clients
                .Include(c => c.Locations)
                .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

            if (client == null)
                return Result.Failure<DomainClient>($"Client with ID {id} not found");

            return Result.Success(client);
        }
        catch (Exception ex)
        {
            return Result.Failure<DomainClient>($"Error retrieving client: {ex.Message}");
        }
    }

    public async Task<Result<DomainClient>> GetByIdWithLocationsAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        // This is the same as GetByIdAsync since we always include locations
        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<Result<DomainClient>> GetByDocumentAsync(
        string documentType,
        string documentValue,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var client = await _clients
                .Include(c => c.Locations)
                .FirstOrDefaultAsync(
                    c =>
                        c.DocumentInfo.Type == documentType
                        && c.DocumentInfo.Value == documentValue,
                    cancellationToken
                );

            if (client == null)
                return Result.Failure<DomainClient>(
                    $"Client with document {documentType}-{documentValue} not found"
                );

            return Result.Success(client);
        }
        catch (Exception ex)
        {
            return Result.Failure<DomainClient>(
                $"Error retrieving client by document: {ex.Message}"
            );
        }
    }

    public async Task<Result<IReadOnlyList<DomainClient>>> GetAllAsync(
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var clients = await _clients.Include(c => c.Locations).ToListAsync(cancellationToken);

            return Result.Success<IReadOnlyList<DomainClient>>(clients.AsReadOnly());
        }
        catch (Exception ex)
        {
            return Result.Failure<IReadOnlyList<DomainClient>>(
                $"Error retrieving clients: {ex.Message}"
            );
        }
    }

    public async Task<Result<IReadOnlyList<DomainClient>>> GetActiveAsync(
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var clients = await _clients
                .Include(c => c.Locations)
                .Where(c => c.IsActive)
                .ToListAsync(cancellationToken);

            return Result.Success<IReadOnlyList<DomainClient>>(clients.AsReadOnly());
        }
        catch (Exception ex)
        {
            return Result.Failure<IReadOnlyList<DomainClient>>(
                $"Error retrieving active clients: {ex.Message}"
            );
        }
    }

    public void Add(DomainClient client)
    {
        _clients.Add(client);
    }

    public void Update(DomainClient client)
    {
        _clients.Update(client);
    }

    public async Task SaveChangesAsync()
    {
        await context.SaveChangesAsync();
    }

    public async Task UpdateAsync(
        DomainClient client,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            // Simple update - load existing client and update properties
            var existingClient = await _clients
                .FirstOrDefaultAsync(c => c.Id == client.Id, cancellationToken);

            if (existingClient == null)
                throw new InvalidOperationException("Client not found");

            // Update client properties directly on the tracked entity
            existingClient.UpdateName(client.Name);
            existingClient.UpdateRazonSocial(client.RazonSocial);
            existingClient.UpdateBusinessType(client.BusinessType);
            existingClient.UpdateContactName(client.ContactName);
            existingClient.UpdateDocumentInfo(client.DocumentInfo);
            existingClient.UpdateFiscalAddress(client.FiscalAddress);
            existingClient.UpdateEmail(client.Email);
            existingClient.UpdatePhoneNumber(client.PhoneNumber);

            await context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new InvalidOperationException(
                "Los datos fueron modificados por otro usuario. Por favor refresque e intente nuevamente."
            );
        }
        catch (DbUpdateException ex)
        {
            throw new InvalidOperationException(
                "Error al guardar los cambios en la base de datos.",
                ex
            );
        }
    }

    public async Task UpdateClientWithLocationsAsync(
        DomainClient client,
        List<(Guid? Id, Address Address)> locations,
        CancellationToken cancellationToken = default
    )
    {
        using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            // Step 1: Update the client basic info
            var existingClient = await _clients
                .FirstOrDefaultAsync(c => c.Id == client.Id, cancellationToken);

            if (existingClient == null)
                throw new InvalidOperationException("Client not found");

            // Update client properties directly on the tracked entity
            existingClient.UpdateName(client.Name);
            existingClient.UpdateRazonSocial(client.RazonSocial);
            existingClient.UpdateBusinessType(client.BusinessType);
            existingClient.UpdateContactName(client.ContactName);
            existingClient.UpdateDocumentInfo(client.DocumentInfo);
            existingClient.UpdateFiscalAddress(client.FiscalAddress);
            existingClient.UpdateEmail(client.Email);
            existingClient.UpdatePhoneNumber(client.PhoneNumber);

            // Step 2: Nuclear option - delete ALL existing locations for this client
            await context.Database.ExecuteSqlRawAsync(
                "DELETE FROM \"DomainClientLocations\" WHERE \"ClientId\" = {0}",
                client.Id
            );

            // Step 3: Insert new locations using raw SQL because EF is garbage
            foreach (var (id, address) in locations)
            {
                var locationId = id ?? Guid.NewGuid();
                var now = DateTime.UtcNow;
                
                await context.Database.ExecuteSqlRawAsync(
                    @"INSERT INTO ""DomainClientLocations"" 
                      (""Id"", ""Address"", ""ClientId"", ""IsActive"", ""CreatedAt"", ""ModifiedAt"") 
                      VALUES ({0}, {1}, {2}, {3}, {4}, {5})",
                    locationId,
                    address.Value,
                    client.Id,
                    true,
                    now,
                    now
                );
            }

            await context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
        }
        catch (Exception)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public void Delete(DomainClient client)
    {
        client.Deactivate(); // Soft delete
    }

    public async Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _clients.AnyAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<bool> ExistsByDocumentAsync(
        string documentType,
        string documentValue,
        CancellationToken cancellationToken = default
    )
    {
        return await _clients.AnyAsync(
            c => c.DocumentInfo.Type == documentType && c.DocumentInfo.Value == documentValue,
            cancellationToken
        );
    }
}

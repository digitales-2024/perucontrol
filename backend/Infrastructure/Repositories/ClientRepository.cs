using Microsoft.EntityFrameworkCore;
using PeruControl.Domain.Common;
using PeruControl.Domain.Repositories;
using PeruControl.Infrastructure.Model;
using DomainClient = PeruControl.Domain.Entities.Client;

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

    public async Task UpdateAsync(
        DomainClient client,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            _clients.Update(client);
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

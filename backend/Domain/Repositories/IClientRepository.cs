using PeruControl.Domain.Common;
using PeruControl.Domain.Entities;

namespace PeruControl.Domain.Repositories;

public interface IClientRepository
{
    Task<Result<Client>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Result<Client>> GetByDocumentAsync(
        string documentType,
        string documentValue,
        CancellationToken cancellationToken = default
    );
    Task<Result<IReadOnlyList<Client>>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Result<IReadOnlyList<Client>>> GetActiveAsync(
        CancellationToken cancellationToken = default
    );
    void Add(Client client);
    void Update(Client client);
    void Delete(Client client);
    Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> ExistsByDocumentAsync(
        string documentType,
        string documentValue,
        CancellationToken cancellationToken = default
    );
}

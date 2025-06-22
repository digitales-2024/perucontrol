using PeruControl.Domain.Common;
using PeruControl.Domain.Repositories;

namespace PeruControl.Application.UseCases.Clients;

public class ReactivateClientUseCase(IClientRepository clientRepository)
{
    public async Task<Result<Unit>> ExecuteAsync(
            Guid id,
        CancellationToken cancellationToken = default
    )
    {
        var clientResult = await clientRepository.GetByIdAsync(id);
        if (clientResult.IsFailure)
        {
            return Result.Failure<Unit>(clientResult.Error);
        }

        var client = clientResult.Value!;
        client.Reactivate();
        await clientRepository.UpdateAsync(client, cancellationToken);

        return Result.Success(Unit.Value);
    }
}

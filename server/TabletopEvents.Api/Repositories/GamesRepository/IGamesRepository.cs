using TabletopEvents.Api.Dtos;

namespace TabletopEvents.Api.Repositories.Games;

public interface IGamesRepository
{
    Task<IReadOnlyList<GameDto>> GetAllAsync(CancellationToken ct);
    Task<bool> ExistsAsync(Guid id, CancellationToken ct);
}

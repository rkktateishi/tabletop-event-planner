using TabletopEvents.Api.Dtos;

namespace TabletopEvents.Api.Repositories.Formats;

public interface IFormatsRepository
{
    /// <summary>All formats, or only those of <paramref name="game"/> when given.</summary>
    Task<IReadOnlyList<FormatDto>> GetAllAsync(Guid? game, CancellationToken ct);
    Task<bool> ExistsAsync(Guid id, CancellationToken ct);
    Task<bool> BelongsToGameAsync(Guid format, Guid game, CancellationToken ct);
}

using Microsoft.EntityFrameworkCore;
using TabletopEvents.Api.Data;
using TabletopEvents.Api.Dtos;

namespace TabletopEvents.Api.Repositories.Formats;

public class FormatsRepository(AppDbContext db) : IFormatsRepository
{
    public async Task<IReadOnlyList<FormatDto>> GetAllAsync(Guid? game, CancellationToken ct)
    {
        var query = db.Formats.AsQueryable();
        if (game is { } gameId)
        {
            query = query.Where(f => f.Game == gameId);
        }

        return await query
            .OrderBy(f => f.Name)
            .Select(f => new FormatDto(f.Id, f.Name, f.Game))
            .ToListAsync(ct);
    }

    public Task<bool> ExistsAsync(Guid id, CancellationToken ct) =>
        db.Formats.AnyAsync(f => f.Id == id, ct);

    public Task<bool> BelongsToGameAsync(Guid format, Guid game, CancellationToken ct) =>
        db.Formats.AnyAsync(f => f.Id == format && f.Game == game, ct);
}

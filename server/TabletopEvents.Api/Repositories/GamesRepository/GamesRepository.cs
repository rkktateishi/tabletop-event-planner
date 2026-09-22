using Microsoft.EntityFrameworkCore;
using TabletopEvents.Api.Data;
using TabletopEvents.Api.Dtos;

namespace TabletopEvents.Api.Repositories.Games;

public class GamesRepository(AppDbContext db) : IGamesRepository
{
    public async Task<IReadOnlyList<GameDto>> GetAllAsync(CancellationToken ct) =>
        await db.Games
            .OrderBy(g => g.Name)
            .Select(g => new GameDto(g.Id, g.Name))
            .ToListAsync(ct);

    public Task<bool> ExistsAsync(Guid id, CancellationToken ct) =>
        db.Games.AnyAsync(g => g.Id == id, ct);
}

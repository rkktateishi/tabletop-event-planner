using Microsoft.EntityFrameworkCore;
using TabletopEvents.Api.Data;
using TabletopEvents.Api.Dtos;

namespace TabletopEvents.Api.Repositories.Templates;

public class TemplatesRepository(AppDbContext db) : ITemplatesRepository
{
    public async Task<IReadOnlyList<TemplateDto>> GetAllAsync(Guid? game, CancellationToken ct)
    {
        var query =
            from t in db.Templates
            join f in db.Formats on t.Format equals f.Id
            select new { Template = t, Format = f };

        if (game is { } gameId)
        {
            query = query.Where(x => x.Format.Game == gameId);
        }

        return await query
            .OrderBy(x => x.Template.Name)
            .Select(x => new TemplateDto(
                x.Template.Id,
                x.Template.Name,
                x.Format.Game,
                x.Template.Format,
                x.Template.DefaultCapacity,
                x.Template.DefaultDurationMinutes))
            .ToListAsync(ct);
    }
}

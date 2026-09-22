using Microsoft.EntityFrameworkCore;
using TabletopEvents.Api.Data;
using TabletopEvents.Api.Dtos;
using TabletopEvents.Api.Models;

namespace TabletopEvents.Api.Repositories.Events;

public class EventsRepository(AppDbContext db) : IEventsRepository
{
    public async Task<IReadOnlyList<EventSummaryDto>> GetSummariesAsync(CancellationToken ct) =>
        await (
            from e in db.Events
            join g in db.Games on e.Game equals g.Id
            join f in db.Formats on e.Format equals f.Id
            orderby e.StartDateTime
            select new EventSummaryDto(e.Id, e.Name, e.Game, e.Format, g.Name, f.Name, e.StartDateTime, e.EndDateTime)
        ).ToListAsync(ct);

    public Task<EventDetailDto?> GetDetailAsync(Guid id, CancellationToken ct) =>
        (
            from e in db.Events
            join g in db.Games on e.Game equals g.Id
            join f in db.Formats on e.Format equals f.Id
            where e.Id == id
            let count = db.EventRegistrations.Count(r => r.EventId == e.Id)
            select new EventDetailDto(
                e.Id,
                e.Name,
                e.Game,
                e.Format,
                g.Name,
                f.Name,
                e.StartDateTime,
                e.EndDateTime,
                e.MaxCapacity,
                e.Description,
                count,
                count >= e.MaxCapacity,
                string.Empty)
        ).SingleOrDefaultAsync(ct);

    public Task<int?> GetMaxCapacityAsync(Guid id, CancellationToken ct) =>
        db.Events
            .Where(e => e.Id == id)
            .Select(e => (int?)e.MaxCapacity)
            .SingleOrDefaultAsync(ct);

    public async Task AddAsync(Event entity, CancellationToken ct)
    {
        db.Events.Add(entity);
        await db.SaveChangesAsync(ct);
    }
}

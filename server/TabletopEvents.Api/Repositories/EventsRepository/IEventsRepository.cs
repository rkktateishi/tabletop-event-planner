using TabletopEvents.Api.Dtos;
using TabletopEvents.Api.Models;

namespace TabletopEvents.Api.Repositories.Events;

public interface IEventsRepository
{
    /// <summary>Calendar summaries ordered by start time.</summary>
    Task<IReadOnlyList<EventSummaryDto>> GetSummariesAsync(CancellationToken ct);

    /// <summary>
    /// Full detail with registration count. <see cref="EventDetailDto.Location"/> is not stored and
    /// comes back empty; the service fills it from configuration.
    /// </summary>
    Task<EventDetailDto?> GetDetailAsync(Guid id, CancellationToken ct);

    /// <summary>Max capacity of an event, or null when it does not exist.</summary>
    Task<int?> GetMaxCapacityAsync(Guid id, CancellationToken ct);

    Task AddAsync(Event entity, CancellationToken ct);
}

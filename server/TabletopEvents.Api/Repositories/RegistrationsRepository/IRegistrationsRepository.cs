using TabletopEvents.Api.Models;

namespace TabletopEvents.Api.Repositories.Registrations;

public interface IRegistrationsRepository
{
    Task<int> CountForEventAsync(Guid eventId, CancellationToken ct);

    /// <summary>
    /// Inserts a registration only if the event still has room (fewer than <paramref name="maxCapacity"/>
    /// registrations). The count-then-insert is atomic with respect to concurrent registrations.
    /// Returns null when the event is full.
    /// </summary>
    Task<EventRegistration?> AddIfCapacityAsync(Guid eventId, int maxCapacity, string playerName, CancellationToken ct);
}

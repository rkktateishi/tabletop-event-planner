namespace TabletopEvents.Api.Dtos;

/// <summary>
/// Event page view. <c>Location</c> is not stored; the repository returns it empty and
/// <c>EventsService</c> fills it from configuration.
/// </summary>
public record EventDetailDto(
    Guid Id,
    string Name,
    Guid Game,
    Guid Format,
    string GameName,
    string FormatName,
    DateTimeOffset StartDateTime,
    DateTimeOffset EndDateTime,
    int MaxCapacity,
    string Description,
    int RegistrationCount,
    bool IsFull,
    string Location);

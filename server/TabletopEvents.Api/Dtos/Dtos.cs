namespace TabletopEvents.Api.Dtos;

public record GameDto(Guid Id, string Name);

public record FormatDto(Guid Id, string Name, Guid Game);

public record TemplateDto(
    Guid Id,
    string Name,
    Guid Game,
    Guid Format,
    int DefaultCapacity,
    int DefaultDurationMinutes);

public record EventSummaryDto(
    Guid Id,
    string Name,
    Guid Game,
    Guid Format,
    string GameName,
    string FormatName,
    DateTimeOffset StartDateTime,
    DateTimeOffset EndDateTime);

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

/// <summary>
/// Validated by <see cref="Services.Events.CreateEventRequestValidator"/>. Every field is nullable so a
/// client can submit exactly what the user entered and let the server report what is missing.
/// </summary>
public class CreateEventRequest
{
    public string? Name { get; set; }
    public Guid? Game { get; set; }
    public Guid? Format { get; set; }
    public DateTimeOffset? StartDateTime { get; set; }
    public DateTimeOffset? EndDateTime { get; set; }
    public int? MaxCapacity { get; set; }
    public string? Description { get; set; }
}

/// <summary>Validated by <see cref="Services.Registrations.RegisterRequestValidator"/>.</summary>
public class RegisterRequest
{
    public string? PlayerName { get; set; }
}

public record RegistrationDto(Guid Id, Guid EventId, string PlayerName);

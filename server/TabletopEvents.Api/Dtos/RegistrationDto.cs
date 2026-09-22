namespace TabletopEvents.Api.Dtos;

/// <summary><c>Event</c> is the FK to the event.</summary>
public record RegistrationDto(Guid Id, Guid Event, string PlayerName);

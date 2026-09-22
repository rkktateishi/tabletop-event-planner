namespace TabletopEvents.Api.Models;

public class EventRegistration
{
    public Guid Id { get; set; }

    /// <summary>FK to <see cref="Event"/>.</summary>
    public Guid EventId { get; set; }

    public string PlayerName { get; set; } = string.Empty;
}

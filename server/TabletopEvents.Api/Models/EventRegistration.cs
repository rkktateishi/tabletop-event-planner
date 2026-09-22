namespace TabletopEvents.Api.Models;

public class EventRegistration
{
    public Guid Id { get; set; }

    /// <summary>FK to <see cref="Models.Event"/>.</summary>
    public Guid Event { get; set; }

    public string PlayerName { get; set; } = string.Empty;
}

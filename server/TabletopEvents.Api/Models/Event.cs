namespace TabletopEvents.Api.Models;

public class Event
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;

    /// <summary>FK to <see cref="Models.Game"/>.</summary>
    public Guid Game { get; set; }

    /// <summary>FK to <see cref="Models.Format"/>. Must belong to <see cref="Game"/>.</summary>
    public Guid Format { get; set; }

    public DateTimeOffset StartDateTime { get; set; }
    public DateTimeOffset EndDateTime { get; set; }
    public int MaxCapacity { get; set; }
    public string Description { get; set; } = string.Empty;
}

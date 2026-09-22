namespace TabletopEvents.Api.Models;

public class Format
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;

    /// <summary>FK to <see cref="Models.Game"/>.</summary>
    public Guid Game { get; set; }
}

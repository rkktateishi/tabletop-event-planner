namespace TabletopEvents.Api.Models;

public class Template
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;

    /// <summary>FK to <see cref="Models.Format"/>. The game is derived through the format.</summary>
    public Guid Format { get; set; }

    public int DefaultCapacity { get; set; }
    public int DefaultDurationMinutes { get; set; }
}

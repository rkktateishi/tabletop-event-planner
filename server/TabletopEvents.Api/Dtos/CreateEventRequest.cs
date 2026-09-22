namespace TabletopEvents.Api.Dtos;

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

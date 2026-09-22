namespace TabletopEvents.Api.Dtos;

/// <summary><c>Game</c> is derived through the template's format; <c>Format</c> is the FK.</summary>
public record TemplateDto(
    Guid Id,
    string Name,
    Guid Game,
    Guid Format,
    int DefaultCapacity,
    int DefaultDurationMinutes);

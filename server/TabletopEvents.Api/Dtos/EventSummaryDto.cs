namespace TabletopEvents.Api.Dtos;

/// <summary>Calendar view of an event; <c>Game</c> and <c>Format</c> are FKs with their names joined in.</summary>
public record EventSummaryDto(
    Guid Id,
    string Name,
    Guid Game,
    Guid Format,
    string GameName,
    string FormatName,
    DateTimeOffset StartDateTime,
    DateTimeOffset EndDateTime);

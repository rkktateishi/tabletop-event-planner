namespace TabletopEvents.Api.Dtos;

/// <summary><c>Game</c> is the FK to the game.</summary>
public record FormatDto(Guid Id, string Name, Guid Game);

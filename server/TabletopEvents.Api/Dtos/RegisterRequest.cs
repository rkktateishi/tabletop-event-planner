namespace TabletopEvents.Api.Dtos;

/// <summary>Validated by <see cref="Services.Registrations.RegisterRequestValidator"/>.</summary>
public class RegisterRequest
{
    public string? PlayerName { get; set; }
}

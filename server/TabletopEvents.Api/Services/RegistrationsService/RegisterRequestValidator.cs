using FluentValidation;
using TabletopEvents.Api.Dtos;

namespace TabletopEvents.Api.Services.Registrations;

/// <summary>The single source of truth for registration rules; the client displays these messages.</summary>
public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public const int PlayerNameMaxLength = 255;

    public RegisterRequestValidator()
    {
        RuleFor(x => x.PlayerName)
            .NotEmpty().WithMessage("Please enter your name.")
            .MaximumLength(PlayerNameMaxLength).WithMessage($"Name must be {PlayerNameMaxLength} characters or fewer.");
    }
}

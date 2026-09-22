using FluentValidation;
using TabletopEvents.Api.Dtos;
using TabletopEvents.Api.Repositories.Formats;
using TabletopEvents.Api.Repositories.Games;

namespace TabletopEvents.Api.Services.Events;

/// <summary>
/// The single source of truth for event creation rules. Clients do not validate; they display these
/// messages keyed by property name.
/// </summary>
public class CreateEventRequestValidator : AbstractValidator<CreateEventRequest>
{
    public const int NameMaxLength = 255;

    public CreateEventRequestValidator(IGamesRepository games, IFormatsRepository formats)
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(NameMaxLength).WithMessage($"Name must be {NameMaxLength} characters or fewer.");

        // NotEmpty on Guid? only catches null, so check Guid.Empty explicitly.
        RuleFor(x => x.Game)
            .Cascade(CascadeMode.Stop)
            .Must(HasValue).WithMessage("Select a game.")
            .MustAsync((game, ct) => games.ExistsAsync(game!.Value, ct))
            .WithMessage("Unknown game.");

        RuleFor(x => x.Format)
            .Cascade(CascadeMode.Stop)
            .Must(HasValue).WithMessage("Select a format.")
            .MustAsync((format, ct) => formats.ExistsAsync(format!.Value, ct))
            .WithMessage("Unknown format.")
            .MustAsync((request, format, ct) => formats.BelongsToGameAsync(format!.Value, request.Game!.Value, ct))
            .When(x => x.Game is { } game && game != Guid.Empty, ApplyConditionTo.CurrentValidator)
            .WithMessage("Format does not belong to the selected game.");

        RuleFor(x => x.StartDateTime)
            .NotNull().WithMessage("Start time is required.");

        RuleFor(x => x.EndDateTime)
            .Cascade(CascadeMode.Stop)
            .NotNull().WithMessage("End time is required.")
            .GreaterThan(x => x.StartDateTime)
            .When(x => x.StartDateTime is not null, ApplyConditionTo.CurrentValidator)
            .WithMessage("End time must be after start time.");

        RuleFor(x => x.MaxCapacity)
            .Cascade(CascadeMode.Stop)
            .NotNull().WithMessage("Capacity is required.")
            .GreaterThanOrEqualTo(1).WithMessage("Capacity must be at least 1.");
    }

    private static bool HasValue(Guid? id) => id is { } value && value != Guid.Empty;
}

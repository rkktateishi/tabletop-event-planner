using FluentValidation.TestHelper;
using TabletopEvents.Api.Data;
using TabletopEvents.Api.Dtos;
using TabletopEvents.Api.Repositories.Formats;
using TabletopEvents.Api.Repositories.Games;
using TabletopEvents.Api.Services.Events;
using TabletopEvents.Api.Tests.Support;

namespace TabletopEvents.Api.Tests.Services.Events;

public class CreateEventRequestValidatorTests : IDisposable
{
    private readonly AppDbContext _db = TestDb.Create();
    private readonly CreateEventRequestValidator _validator;

    public CreateEventRequestValidatorTests()
    {
        _validator = new CreateEventRequestValidator(new GamesRepository(_db), new FormatsRepository(_db));
    }

    public void Dispose() => _db.Dispose();

    /// <summary>A valid request, optionally tweaked for the case under test.</summary>
    private static CreateEventRequest Request(Action<CreateEventRequest>? mutate = null)
    {
        var request = new CreateEventRequest
        {
            Name = "Friday Night CC",
            Game = SeedData.GameIds.FleshAndBlood,
            Format = SeedData.FormatIds.ClassicConstructed,
            StartDateTime = new DateTimeOffset(2026, 9, 25, 18, 0, 0, TimeSpan.Zero),
            EndDateTime = new DateTimeOffset(2026, 9, 25, 23, 0, 0, TimeSpan.Zero),
            MaxCapacity = 30,
            Description = "Weekly tournament",
        };
        mutate?.Invoke(request);
        return request;
    }

    [Fact]
    public async Task Valid_request_passes()
    {
        var result = await _validator.TestValidateAsync(Request());
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public async Task Empty_request_reports_every_required_field_once()
    {
        var result = await _validator.TestValidateAsync(new CreateEventRequest());

        result.ShouldHaveValidationErrorFor(x => x.Name).WithErrorMessage("Name is required.");
        result.ShouldHaveValidationErrorFor(x => x.Game).WithErrorMessage("Select a game.");
        result.ShouldHaveValidationErrorFor(x => x.Format).WithErrorMessage("Select a format.");
        result.ShouldHaveValidationErrorFor(x => x.StartDateTime).WithErrorMessage("Start time is required.");
        result.ShouldHaveValidationErrorFor(x => x.EndDateTime).WithErrorMessage("End time is required.");
        result.ShouldHaveValidationErrorFor(x => x.MaxCapacity).WithErrorMessage("Capacity is required.");
        Assert.Equal(6, result.Errors.Count);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task Name_is_required(string? name)
    {
        var result = await _validator.TestValidateAsync(Request(r => r.Name = name));
        result.ShouldHaveValidationErrorFor(x => x.Name).WithErrorMessage("Name is required.");
    }

    [Fact]
    public async Task Name_is_limited_to_255_characters()
    {
        var result = await _validator.TestValidateAsync(Request(r => r.Name = new string('x', 256)));
        result.ShouldHaveValidationErrorFor(x => x.Name).WithErrorMessage("Name must be 255 characters or fewer.");
    }

    [Fact]
    public async Task Game_is_required()
    {
        var result = await _validator.TestValidateAsync(Request(r => r.Game = null));
        result.ShouldHaveValidationErrorFor(x => x.Game).WithErrorMessage("Select a game.");

        result = await _validator.TestValidateAsync(Request(r => r.Game = Guid.Empty));
        result.ShouldHaveValidationErrorFor(x => x.Game).WithErrorMessage("Select a game.");
    }

    [Fact]
    public async Task Unknown_game_is_rejected()
    {
        var result = await _validator.TestValidateAsync(Request(r => r.Game = Guid.NewGuid()));
        result.ShouldHaveValidationErrorFor(x => x.Game).WithErrorMessage("Unknown game.");
    }

    [Fact]
    public async Task Format_is_required()
    {
        var result = await _validator.TestValidateAsync(Request(r => r.Format = null));
        result.ShouldHaveValidationErrorFor(x => x.Format).WithErrorMessage("Select a format.");
    }

    [Fact]
    public async Task Unknown_format_is_rejected_with_a_single_error()
    {
        var result = await _validator.TestValidateAsync(Request(r => r.Format = Guid.NewGuid()));
        result.ShouldHaveValidationErrorFor(x => x.Format).WithErrorMessage("Unknown format.");
        Assert.Single(result.Errors, e => e.PropertyName == nameof(CreateEventRequest.Format));
    }

    [Fact]
    public async Task Format_must_belong_to_the_selected_game()
    {
        // EDH is a Magic format; the request names Flesh and Blood.
        var result = await _validator.TestValidateAsync(Request(r => r.Format = SeedData.FormatIds.Edh));
        result.ShouldHaveValidationErrorFor(x => x.Format)
            .WithErrorMessage("Format does not belong to the selected game.");
    }

    [Fact]
    public async Task Format_game_mismatch_is_not_reported_when_the_game_is_missing()
    {
        var result = await _validator.TestValidateAsync(Request(r => r.Game = null));
        result.ShouldNotHaveValidationErrorFor(x => x.Format);
    }

    [Fact]
    public async Task Start_time_is_required()
    {
        var result = await _validator.TestValidateAsync(Request(r => r.StartDateTime = null));
        result.ShouldHaveValidationErrorFor(x => x.StartDateTime).WithErrorMessage("Start time is required.");
        // Without a start there is nothing to compare the end against.
        result.ShouldNotHaveValidationErrorFor(x => x.EndDateTime);
    }

    [Fact]
    public async Task End_time_is_required()
    {
        var result = await _validator.TestValidateAsync(Request(r => r.EndDateTime = null));
        result.ShouldHaveValidationErrorFor(x => x.EndDateTime).WithErrorMessage("End time is required.");
    }

    [Fact]
    public async Task End_must_be_after_start()
    {
        var result = await _validator.TestValidateAsync(Request(r => r.EndDateTime = r.StartDateTime));
        result.ShouldHaveValidationErrorFor(x => x.EndDateTime).WithErrorMessage("End time must be after start time.");
    }

    [Fact]
    public async Task Capacity_is_required()
    {
        var result = await _validator.TestValidateAsync(Request(r => r.MaxCapacity = null));
        result.ShouldHaveValidationErrorFor(x => x.MaxCapacity).WithErrorMessage("Capacity is required.");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    public async Task Capacity_must_be_at_least_one(int capacity)
    {
        var result = await _validator.TestValidateAsync(Request(r => r.MaxCapacity = capacity));
        result.ShouldHaveValidationErrorFor(x => x.MaxCapacity).WithErrorMessage("Capacity must be at least 1.");
    }

    [Fact]
    public async Task Description_is_optional()
    {
        var result = await _validator.TestValidateAsync(Request(r => r.Description = null));
        result.ShouldNotHaveAnyValidationErrors();
    }
}

using FluentValidation.TestHelper;
using TabletopEvents.Api.Dtos;
using TabletopEvents.Api.Services.Registrations;

namespace TabletopEvents.Api.Tests.Services.Registrations;

public class RegisterRequestValidatorTests
{
    private readonly RegisterRequestValidator _validator = new();

    [Fact]
    public void Valid_name_passes()
    {
        var result = _validator.TestValidate(new RegisterRequest { PlayerName = "Alice" });
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Name_is_required(string? name)
    {
        var result = _validator.TestValidate(new RegisterRequest { PlayerName = name });
        result.ShouldHaveValidationErrorFor(x => x.PlayerName).WithErrorMessage("Please enter your name.");
    }

    [Fact]
    public void Name_is_limited_to_255_characters()
    {
        var result = _validator.TestValidate(new RegisterRequest { PlayerName = new string('a', 256) });
        result.ShouldHaveValidationErrorFor(x => x.PlayerName).WithErrorMessage("Name must be 255 characters or fewer.");
    }

    [Fact]
    public void Name_of_exactly_255_characters_is_allowed()
    {
        var result = _validator.TestValidate(new RegisterRequest { PlayerName = new string('a', 255) });
        result.ShouldNotHaveAnyValidationErrors();
    }
}

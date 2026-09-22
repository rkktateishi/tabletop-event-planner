using Microsoft.AspNetCore.Mvc.ModelBinding;
using TabletopEvents.Api.Validation;

namespace TabletopEvents.Api.Tests.Validation;

public class BindingErrorsTests
{
    [Theory]
    [InlineData("$.maxCapacity", "MaxCapacity")]
    [InlineData("$.startDateTime", "StartDateTime")]
    [InlineData("$.nested.field", "Field")]
    [InlineData("$.items[0]", "Items")]
    public void ToPropertyName_pascal_cases_the_json_path_leaf(string key, string expected)
    {
        Assert.Equal(expected, BindingErrors.ToPropertyName(key));
    }

    [Theory]
    [InlineData("request")]
    [InlineData("")]
    [InlineData("$.")]
    public void ToPropertyName_returns_null_for_non_property_keys(string key)
    {
        Assert.Null(BindingErrors.ToPropertyName(key));
    }

    [Fact]
    public void Normalize_rewrites_a_property_binding_error_and_drops_the_generic_one()
    {
        var modelState = new ModelStateDictionary();
        modelState.AddModelError("$.maxCapacity", "The JSON value could not be converted to System.Nullable`1[System.Int32].");
        modelState.AddModelError("request", "The request field is required.");

        BindingErrors.Normalize(modelState);

        var entry = Assert.Single(modelState);
        Assert.Equal("MaxCapacity", entry.Key);
        Assert.Equal(BindingErrors.InvalidValueMessage, Assert.Single(entry.Value!.Errors).ErrorMessage);
    }

    [Fact]
    public void Normalize_keeps_a_generic_error_when_nothing_points_at_a_property()
    {
        var modelState = new ModelStateDictionary();
        modelState.AddModelError("request", "The request field is required.");

        BindingErrors.Normalize(modelState);

        var entry = Assert.Single(modelState);
        Assert.Equal(string.Empty, entry.Key);
        Assert.Equal(BindingErrors.InvalidBodyMessage, Assert.Single(entry.Value!.Errors).ErrorMessage);
    }

    [Fact]
    public void Normalize_leaves_a_valid_model_state_alone()
    {
        var modelState = new ModelStateDictionary();
        BindingErrors.Normalize(modelState);
        Assert.True(modelState.IsValid);
    }
}

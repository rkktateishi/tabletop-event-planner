using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace TabletopEvents.Api.Validation;

/// <summary>
/// Translates model-binding failures (malformed JSON, a string where a number was expected, …) into
/// the same property-keyed shape as FluentValidation errors, so clients handle one format.
/// </summary>
public static class BindingErrors
{
    public const string InvalidValueMessage = "Invalid value.";
    public const string InvalidBodyMessage = "The request body is missing or malformed.";

    /// <summary>
    /// Maps a model-state key to a PascalCase property name: <c>$.maxCapacity</c> → <c>MaxCapacity</c>,
    /// <c>$.nested.field</c> → <c>Field</c>. Returns null for keys that do not point at a property
    /// (the parameter itself, or an empty key).
    /// </summary>
    public static string? ToPropertyName(string modelStateKey)
    {
        if (string.IsNullOrWhiteSpace(modelStateKey) || !modelStateKey.StartsWith("$.", StringComparison.Ordinal))
        {
            return null;
        }

        var last = modelStateKey[2..].Split('.', StringSplitOptions.RemoveEmptyEntries).LastOrDefault();
        if (string.IsNullOrEmpty(last))
        {
            return null;
        }

        // Strip an array index such as items[0]
        var bracket = last.IndexOf('[');
        if (bracket > 0)
        {
            last = last[..bracket];
        }

        return char.ToUpperInvariant(last[0]) + last[1..];
    }

    /// <summary>Rewrites raw binding errors in <paramref name="modelState"/> into property-keyed, user-facing ones.</summary>
    public static void Normalize(ModelStateDictionary modelState)
    {
        var raw = modelState
            .Where(kv => kv.Value?.Errors.Count > 0)
            .Select(kv => kv.Key)
            .ToList();

        if (raw.Count == 0)
        {
            return;
        }

        var normalized = new Dictionary<string, string>(StringComparer.Ordinal);
        foreach (var key in raw)
        {
            var property = ToPropertyName(key);
            normalized[property ?? string.Empty] = property is null ? InvalidBodyMessage : InvalidValueMessage;
            modelState.Remove(key);
        }

        // A property-level error already explains the problem; drop the generic body error in that case.
        if (normalized.Count > 1)
        {
            normalized.Remove(string.Empty);
        }

        foreach (var (property, message) in normalized)
        {
            modelState.AddModelError(property, message);
        }
    }
}

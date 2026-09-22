using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.Infrastructure;

namespace TabletopEvents.Api.Validation;

/// <summary>
/// The one place that turns an invalid request into a 400. It first normalizes any model-binding
/// failures (see <see cref="BindingErrors"/>), then runs the registered <see cref="IValidator{T}"/> for
/// every action argument that has one, and short-circuits with a <see cref="ValidationProblemDetails"/>
/// whose <c>errors</c> are keyed by PascalCase property name. Clients render those messages verbatim.
/// </summary>
public sealed class FluentValidationActionFilter(ProblemDetailsFactory problemDetailsFactory) : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var services = context.HttpContext.RequestServices;
        var cancellationToken = context.HttpContext.RequestAborted;

        if (!context.ModelState.IsValid)
        {
            // Binding failed, so the argument may be null or partially populated; report and stop.
            BindingErrors.Normalize(context.ModelState);
            context.Result = Problem(context);
            return;
        }

        foreach (var argument in context.ActionArguments.Values)
        {
            if (argument is null)
            {
                continue;
            }

            var validatorType = typeof(IValidator<>).MakeGenericType(argument.GetType());
            if (services.GetService(validatorType) is not IValidator validator)
            {
                continue;
            }

            var result = await validator.ValidateAsync(new ValidationContext<object>(argument), cancellationToken);
            foreach (var error in result.Errors)
            {
                context.ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
        }

        if (!context.ModelState.IsValid)
        {
            context.Result = Problem(context);
            return;
        }

        await next();
    }

    private BadRequestObjectResult Problem(ActionExecutingContext context) =>
        new(problemDetailsFactory.CreateValidationProblemDetails(context.HttpContext, context.ModelState));
}

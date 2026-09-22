using Microsoft.AspNetCore.Mvc;
using TabletopEvents.Api.Dtos;
using TabletopEvents.Api.Repositories.Events;
using TabletopEvents.Api.Repositories.Registrations;
using TabletopEvents.Api.Services.Events;

namespace TabletopEvents.Api.Services.Registrations;

[ApiController]
[Route("api/events/{eventId:guid}/registrations")]
public class RegistrationsService(IEventsRepository events, IRegistrationsRepository registrations) : ControllerBase
{
    public const string EventFullMessage = "Unfortunately this event has already been filled.";

    /// <summary>
    /// Registers a player for an event. The request is validated by <see cref="RegisterRequestValidator"/>.
    /// Returns 404 when the event does not exist and 409 Conflict when it is at capacity.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<RegistrationDto>> Register(Guid eventId, [FromBody] RegisterRequest request, CancellationToken ct)
    {
        var maxCapacity = await events.GetMaxCapacityAsync(eventId, ct);
        if (maxCapacity is null)
        {
            return NotFound();
        }

        var registration = await registrations.AddIfCapacityAsync(eventId, maxCapacity.Value, request.PlayerName!.Trim(), ct);
        if (registration is null)
        {
            return Conflict(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "Event is full",
                Detail = EventFullMessage,
            });
        }

        return CreatedAtRoute(
            EventsService.GetByIdRoute,
            new { id = eventId },
            new RegistrationDto(registration.Id, registration.EventId, registration.PlayerName));
    }
}

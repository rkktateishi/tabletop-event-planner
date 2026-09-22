using Microsoft.AspNetCore.Mvc;
using TabletopEvents.Api.Dtos;
using TabletopEvents.Api.Models;
using TabletopEvents.Api.Repositories.Events;

namespace TabletopEvents.Api.Services.Events;

[ApiController]
[Route("api/events")]
public class EventsService(IEventsRepository events, IConfiguration configuration) : ControllerBase
{
    public const string GetByIdRoute = "GetEventById";

    private string StoreLocation => configuration["Store:Location"] ?? "Local Game Store";

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EventSummaryDto>>> GetAll(CancellationToken ct) =>
        Ok(await events.GetSummariesAsync(ct));

    [HttpGet("{id:guid}", Name = GetByIdRoute)]
    public async Task<ActionResult<EventDetailDto>> GetById(Guid id, CancellationToken ct)
    {
        var dto = await LoadDetail(id, ct);
        return dto is null ? NotFound() : Ok(dto);
    }

    /// <summary>
    /// Creates an event. <see cref="CreateEventRequestValidator"/> (run by
    /// <see cref="Validation.FluentValidationActionFilter"/>) guarantees every field is present and valid
    /// before this action executes, so the null-forgiving operators below are safe.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<EventDetailDto>> Create([FromBody] CreateEventRequest request, CancellationToken ct)
    {
        var entity = new Event
        {
            Id = Guid.NewGuid(),
            Name = request.Name!.Trim(),
            Game = request.Game!.Value,
            Format = request.Format!.Value,
            StartDateTime = request.StartDateTime!.Value.ToUniversalTime(),
            EndDateTime = request.EndDateTime!.Value.ToUniversalTime(),
            MaxCapacity = request.MaxCapacity!.Value,
            Description = request.Description?.Trim() ?? string.Empty,
        };

        await events.AddAsync(entity, ct);

        var dto = await LoadDetail(entity.Id, ct);
        return CreatedAtRoute(GetByIdRoute, new { id = entity.Id }, dto);
    }

    /// <summary>Detail with the store location, which is configuration rather than data.</summary>
    private async Task<EventDetailDto?> LoadDetail(Guid id, CancellationToken ct)
    {
        var dto = await events.GetDetailAsync(id, ct);
        return dto is null ? null : dto with { Location = StoreLocation };
    }
}

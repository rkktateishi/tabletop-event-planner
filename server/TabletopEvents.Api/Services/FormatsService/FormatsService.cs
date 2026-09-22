using Microsoft.AspNetCore.Mvc;
using TabletopEvents.Api.Dtos;
using TabletopEvents.Api.Repositories.Formats;

namespace TabletopEvents.Api.Services.Formats;

[ApiController]
[Route("api/formats")]
public class FormatsService(IFormatsRepository formats) : ControllerBase
{
    /// <summary>Lists formats, optionally filtered by game.</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<FormatDto>>> GetAll([FromQuery] Guid? game, CancellationToken ct) =>
        Ok(await formats.GetAllAsync(game, ct));
}

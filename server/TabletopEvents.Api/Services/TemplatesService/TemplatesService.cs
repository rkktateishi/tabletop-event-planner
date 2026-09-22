using Microsoft.AspNetCore.Mvc;
using TabletopEvents.Api.Dtos;
using TabletopEvents.Api.Repositories.Templates;

namespace TabletopEvents.Api.Services.Templates;

[ApiController]
[Route("api/templates")]
public class TemplatesService(ITemplatesRepository templates) : ControllerBase
{
    /// <summary>Lists templates, optionally filtered by game (derived through the template's format).</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TemplateDto>>> GetAll([FromQuery] Guid? game, CancellationToken ct) =>
        Ok(await templates.GetAllAsync(game, ct));
}

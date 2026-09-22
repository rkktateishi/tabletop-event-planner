using Microsoft.AspNetCore.Mvc;
using TabletopEvents.Api.Dtos;
using TabletopEvents.Api.Repositories.Games;

namespace TabletopEvents.Api.Services.Games;

[ApiController]
[Route("api/games")]
public class GamesService(IGamesRepository games) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<GameDto>>> GetAll(CancellationToken ct) =>
        Ok(await games.GetAllAsync(ct));
}

using TabletopEvents.Api.Dtos;

namespace TabletopEvents.Api.Repositories.Templates;

public interface ITemplatesRepository
{
    /// <summary>All templates, or only those whose format belongs to <paramref name="game"/> when given.</summary>
    Task<IReadOnlyList<TemplateDto>> GetAllAsync(Guid? game, CancellationToken ct);
}

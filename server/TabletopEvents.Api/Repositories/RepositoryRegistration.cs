using TabletopEvents.Api.Repositories.Events;
using TabletopEvents.Api.Repositories.Formats;
using TabletopEvents.Api.Repositories.Games;
using TabletopEvents.Api.Repositories.Registrations;
using TabletopEvents.Api.Repositories.Templates;

namespace TabletopEvents.Api.Repositories;

public static class RepositoryRegistration
{
    /// <summary>Registers every repository as scoped (they share the request's <c>AppDbContext</c>).</summary>
    public static IServiceCollection AddRepositories(this IServiceCollection services) =>
        services
            .AddScoped<IGamesRepository, GamesRepository>()
            .AddScoped<IFormatsRepository, FormatsRepository>()
            .AddScoped<ITemplatesRepository, TemplatesRepository>()
            .AddScoped<IEventsRepository, EventsRepository>()
            .AddScoped<IRegistrationsRepository, RegistrationsRepository>();
}

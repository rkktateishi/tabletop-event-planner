using TabletopEvents.Api.Data;
using TabletopEvents.Api.Models;
using TabletopEvents.Api.Repositories.Events;
using TabletopEvents.Api.Tests.Support;

namespace TabletopEvents.Api.Tests.Repositories;

public class EventsRepositoryTests : IDisposable
{
    private readonly AppDbContext _db = TestDb.Create();
    private readonly EventsRepository _repo;

    public EventsRepositoryTests()
    {
        _repo = new EventsRepository(_db);
    }

    public void Dispose() => _db.Dispose();

    private static Event NewEvent(string name, DateTimeOffset start, int capacity = 8) => new()
    {
        Id = Guid.NewGuid(),
        Name = name,
        Game = SeedData.GameIds.FleshAndBlood,
        Format = SeedData.FormatIds.Blitz,
        StartDateTime = start,
        EndDateTime = start.AddHours(3),
        MaxCapacity = capacity,
        Description = "desc",
    };

    [Fact]
    public async Task AddAsync_persists_and_summaries_are_ordered_by_start()
    {
        var later = NewEvent("Later", new DateTimeOffset(2026, 10, 2, 18, 0, 0, TimeSpan.Zero));
        var earlier = NewEvent("Earlier", new DateTimeOffset(2026, 10, 1, 18, 0, 0, TimeSpan.Zero));
        await _repo.AddAsync(later, CancellationToken.None);
        await _repo.AddAsync(earlier, CancellationToken.None);

        var summaries = await _repo.GetSummariesAsync(CancellationToken.None);

        Assert.Equal(["Earlier", "Later"], summaries.Select(s => s.Name));
        var first = summaries[0];
        Assert.Equal("Flesh and Blood", first.GameName);
        Assert.Equal("Blitz", first.FormatName);
        Assert.Equal(SeedData.GameIds.FleshAndBlood, first.Game);
        Assert.Equal(SeedData.FormatIds.Blitz, first.Format);
    }

    [Fact]
    public async Task GetDetailAsync_joins_names_and_counts_registrations()
    {
        var evt = NewEvent("Detail", new DateTimeOffset(2026, 10, 1, 18, 0, 0, TimeSpan.Zero), capacity: 2);
        await _repo.AddAsync(evt, CancellationToken.None);
        _db.EventRegistrations.AddRange(
            new EventRegistration { Id = Guid.NewGuid(), EventId = evt.Id, PlayerName = "A" },
            new EventRegistration { Id = Guid.NewGuid(), EventId = evt.Id, PlayerName = "B" });
        await _db.SaveChangesAsync();

        var detail = await _repo.GetDetailAsync(evt.Id, CancellationToken.None);

        Assert.NotNull(detail);
        Assert.Equal("Detail", detail.Name);
        Assert.Equal("Flesh and Blood", detail.GameName);
        Assert.Equal("Blitz", detail.FormatName);
        Assert.Equal(2, detail.RegistrationCount);
        Assert.True(detail.IsFull);
        Assert.Equal(string.Empty, detail.Location); // filled in by the service from configuration
    }

    [Fact]
    public async Task GetDetailAsync_and_GetMaxCapacityAsync_return_null_for_unknown_ids()
    {
        Assert.Null(await _repo.GetDetailAsync(Guid.NewGuid(), CancellationToken.None));
        Assert.Null(await _repo.GetMaxCapacityAsync(Guid.NewGuid(), CancellationToken.None));
    }

    [Fact]
    public async Task GetMaxCapacityAsync_returns_the_capacity()
    {
        var evt = NewEvent("Cap", new DateTimeOffset(2026, 10, 1, 18, 0, 0, TimeSpan.Zero), capacity: 12);
        await _repo.AddAsync(evt, CancellationToken.None);

        Assert.Equal(12, await _repo.GetMaxCapacityAsync(evt.Id, CancellationToken.None));
    }
}

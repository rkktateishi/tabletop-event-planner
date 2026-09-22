using TabletopEvents.Api.Data;
using TabletopEvents.Api.Models;
using TabletopEvents.Api.Repositories.Registrations;
using TabletopEvents.Api.Tests.Support;

namespace TabletopEvents.Api.Tests.Repositories;

public class RegistrationsRepositoryTests : IDisposable
{
    private readonly AppDbContext _db = TestDb.Create();
    private readonly RegistrationsRepository _repo;
    private readonly Guid _eventId = Guid.NewGuid();

    public RegistrationsRepositoryTests()
    {
        _repo = new RegistrationsRepository(_db);
        _db.Events.Add(new Event
        {
            Id = _eventId,
            Name = "Small",
            Game = SeedData.GameIds.Lorcana,
            Format = SeedData.FormatIds.CoreConstructed,
            StartDateTime = new DateTimeOffset(2026, 10, 1, 18, 0, 0, TimeSpan.Zero),
            EndDateTime = new DateTimeOffset(2026, 10, 1, 21, 0, 0, TimeSpan.Zero),
            MaxCapacity = 2,
            Description = string.Empty,
        });
        _db.SaveChanges();
    }

    public void Dispose() => _db.Dispose();

    [Fact]
    public async Task Registers_until_capacity_then_returns_null()
    {
        var first = await _repo.AddIfCapacityAsync(_eventId, 2, "Alice", CancellationToken.None);
        var second = await _repo.AddIfCapacityAsync(_eventId, 2, "Bob", CancellationToken.None);
        var third = await _repo.AddIfCapacityAsync(_eventId, 2, "Cara", CancellationToken.None);

        Assert.NotNull(first);
        Assert.NotNull(second);
        Assert.Null(third);
        Assert.Equal(2, await _repo.CountForEventAsync(_eventId, CancellationToken.None));
    }

    [Fact]
    public async Task Registration_carries_the_event_and_player_name()
    {
        var registration = await _repo.AddIfCapacityAsync(_eventId, 2, "Alice", CancellationToken.None);

        Assert.NotNull(registration);
        Assert.Equal(_eventId, registration.Event);
        Assert.Equal("Alice", registration.PlayerName);
        Assert.NotEqual(Guid.Empty, registration.Id);
    }

    [Fact]
    public async Task Count_is_per_event()
    {
        await _repo.AddIfCapacityAsync(_eventId, 2, "Alice", CancellationToken.None);

        Assert.Equal(1, await _repo.CountForEventAsync(_eventId, CancellationToken.None));
        Assert.Equal(0, await _repo.CountForEventAsync(Guid.NewGuid(), CancellationToken.None));
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using TabletopEvents.Api.Data;

namespace TabletopEvents.Api.Tests.Support;

/// <summary>Creates an isolated in-memory <see cref="AppDbContext"/> populated with the SPECS.md seed data.</summary>
public static class TestDb
{
    public static AppDbContext Create()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            // The in-memory provider has no transactions; repositories that open one still work.
            .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;

        var db = new AppDbContext(options);
        db.Database.EnsureCreated(); // applies HasData seed
        return db;
    }
}

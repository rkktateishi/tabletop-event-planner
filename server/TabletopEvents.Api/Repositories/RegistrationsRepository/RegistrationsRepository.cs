using System.Data;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using TabletopEvents.Api.Data;
using TabletopEvents.Api.Models;

namespace TabletopEvents.Api.Repositories.Registrations;

public class RegistrationsRepository(AppDbContext db) : IRegistrationsRepository
{
    public Task<int> CountForEventAsync(Guid eventId, CancellationToken ct) =>
        db.EventRegistrations.CountAsync(r => r.EventId == eventId, ct);

    public async Task<EventRegistration?> AddIfCapacityAsync(Guid eventId, int maxCapacity, string playerName, CancellationToken ct)
    {
        var strategy = db.Database.CreateExecutionStrategy();
        try
        {
            return await strategy.ExecuteAsync(async token =>
            {
                // Serializable so two concurrent registrations cannot both see "room left".
                await using var tx = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, token);

                var count = await CountForEventAsync(eventId, token);
                if (count >= maxCapacity)
                {
                    return null;
                }

                var entity = new EventRegistration
                {
                    Id = Guid.NewGuid(),
                    EventId = eventId,
                    PlayerName = playerName,
                };
                db.EventRegistrations.Add(entity);
                await db.SaveChangesAsync(token);
                await tx.CommitAsync(token);
                return entity;
            }, ct);
        }
        catch (Exception ex) when (IsSerializationFailure(ex))
        {
            // A concurrent registration won the race; treat conservatively as full.
            return null;
        }
    }

    private static bool IsSerializationFailure(Exception ex) =>
        ex is PostgresException { SqlState: PostgresErrorCodes.SerializationFailure }
        || ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.SerializationFailure };
}

using Microsoft.EntityFrameworkCore;
using TabletopEvents.Api.Models;

namespace TabletopEvents.Api.Data;

/// <summary>
/// Seed rows from SPECS.md. Ids are constant so the seed is baked into the migration
/// and stays idempotent across runs.
/// </summary>
public static class SeedData
{
    public static class GameIds
    {
        public static readonly Guid MagicTheGathering = new("11111111-1111-1111-1111-111111111111");
        public static readonly Guid FleshAndBlood = new("22222222-2222-2222-2222-222222222222");
        public static readonly Guid Lorcana = new("33333333-3333-3333-3333-333333333333");
    }

    public static class FormatIds
    {
        public static readonly Guid Edh = new("a1a1a1a1-0001-4000-8000-000000000001");
        public static readonly Guid Standard = new("a1a1a1a1-0001-4000-8000-000000000002");
        public static readonly Guid Modern = new("a1a1a1a1-0001-4000-8000-000000000003");
        public static readonly Guid ClassicConstructed = new("a1a1a1a1-0002-4000-8000-000000000001");
        public static readonly Guid Blitz = new("a1a1a1a1-0002-4000-8000-000000000002");
        public static readonly Guid CoreConstructed = new("a1a1a1a1-0003-4000-8000-000000000001");
        public static readonly Guid InfinityConstructed = new("a1a1a1a1-0003-4000-8000-000000000002");
    }

    public static class TemplateIds
    {
        public static readonly Guid MtgEdh = new("b2b2b2b2-0001-4000-8000-000000000001");
        public static readonly Guid MtgStandard = new("b2b2b2b2-0001-4000-8000-000000000002");
        public static readonly Guid FabCc = new("b2b2b2b2-0002-4000-8000-000000000001");
        public static readonly Guid LorcanaCc = new("b2b2b2b2-0003-4000-8000-000000000001");
    }

    public static void Apply(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Game>().HasData(
            new Game { Id = GameIds.MagicTheGathering, Name = "Magic: The Gathering" },
            new Game { Id = GameIds.FleshAndBlood, Name = "Flesh and Blood" },
            new Game { Id = GameIds.Lorcana, Name = "Lorcana" });

        modelBuilder.Entity<Format>().HasData(
            new Format { Id = FormatIds.Edh, Name = "EDH", Game = GameIds.MagicTheGathering },
            new Format { Id = FormatIds.Standard, Name = "Standard", Game = GameIds.MagicTheGathering },
            new Format { Id = FormatIds.Modern, Name = "Modern", Game = GameIds.MagicTheGathering },
            new Format { Id = FormatIds.ClassicConstructed, Name = "Classic Constructed (CC)", Game = GameIds.FleshAndBlood },
            new Format { Id = FormatIds.Blitz, Name = "Blitz", Game = GameIds.FleshAndBlood },
            new Format { Id = FormatIds.CoreConstructed, Name = "Core Constructed", Game = GameIds.Lorcana },
            new Format { Id = FormatIds.InfinityConstructed, Name = "Infinity Constructed", Game = GameIds.Lorcana });

        // DefaultDurationMinutes is not in SPECS.md; values are reasonable defaults.
        modelBuilder.Entity<Template>().HasData(
            new Template { Id = TemplateIds.MtgEdh, Name = "MTG - EDH", Format = FormatIds.Edh, DefaultCapacity = 10, DefaultDurationMinutes = 240 },
            new Template { Id = TemplateIds.MtgStandard, Name = "MTG - Standard", Format = FormatIds.Standard, DefaultCapacity = 30, DefaultDurationMinutes = 300 },
            new Template { Id = TemplateIds.FabCc, Name = "FAB - CC", Format = FormatIds.ClassicConstructed, DefaultCapacity = 30, DefaultDurationMinutes = 300 },
            new Template { Id = TemplateIds.LorcanaCc, Name = "Lorcana - CC", Format = FormatIds.CoreConstructed, DefaultCapacity = 30, DefaultDurationMinutes = 300 });
    }
}

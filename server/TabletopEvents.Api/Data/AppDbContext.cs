using Microsoft.EntityFrameworkCore;
using TabletopEvents.Api.Models;

namespace TabletopEvents.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Game> Games => Set<Game>();
    public DbSet<Format> Formats => Set<Format>();
    public DbSet<Template> Templates => Set<Template>();
    public DbSet<Event> Events => Set<Event>();
    public DbSet<EventRegistration> EventRegistrations => Set<EventRegistration>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // FK properties are named exactly as in SPECS.md (Game, Format), so the entities
        // carry no navigation properties; relationships are configured explicitly here.

        modelBuilder.Entity<Game>(b =>
        {
            b.ToTable("Games");
            b.HasKey(x => x.Id);
            b.Property(x => x.Name).HasMaxLength(255).IsRequired();
        });

        modelBuilder.Entity<Format>(b =>
        {
            b.ToTable("Formats");
            b.HasKey(x => x.Id);
            b.Property(x => x.Name).HasMaxLength(255).IsRequired();
            b.HasOne<Game>().WithMany().HasForeignKey(x => x.Game).OnDelete(DeleteBehavior.Restrict);
            b.HasIndex(x => x.Game);
        });

        modelBuilder.Entity<Template>(b =>
        {
            b.ToTable("Templates");
            b.HasKey(x => x.Id);
            b.Property(x => x.Name).HasMaxLength(255).IsRequired();
            b.HasOne<Format>().WithMany().HasForeignKey(x => x.Format).OnDelete(DeleteBehavior.Restrict);
            b.HasIndex(x => x.Format);
        });

        modelBuilder.Entity<Event>(b =>
        {
            b.ToTable("Events");
            b.HasKey(x => x.Id);
            b.Property(x => x.Name).HasMaxLength(255).IsRequired();
            b.Property(x => x.Description).HasColumnType("text").IsRequired();
            b.Property(x => x.StartDateTime).HasColumnType("timestamp with time zone");
            b.Property(x => x.EndDateTime).HasColumnType("timestamp with time zone");
            b.HasOne<Game>().WithMany().HasForeignKey(x => x.Game).OnDelete(DeleteBehavior.Restrict);
            b.HasOne<Format>().WithMany().HasForeignKey(x => x.Format).OnDelete(DeleteBehavior.Restrict);
            b.HasIndex(x => x.Game);
            b.HasIndex(x => x.Format);
            b.HasIndex(x => x.StartDateTime);
        });

        modelBuilder.Entity<EventRegistration>(b =>
        {
            b.ToTable("EventRegistrations");
            b.HasKey(x => x.Id);
            b.Property(x => x.PlayerName).HasMaxLength(255).IsRequired();
            b.HasOne<Event>().WithMany().HasForeignKey(x => x.Event).OnDelete(DeleteBehavior.Cascade);
            b.HasIndex(x => x.Event);
        });

        SeedData.Apply(modelBuilder);
    }
}

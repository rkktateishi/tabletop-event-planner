using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace TabletopEvents.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Games",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Games", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Formats",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Game = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Formats", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Formats_Games_Game",
                        column: x => x.Game,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Events",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Game = table.Column<Guid>(type: "uuid", nullable: false),
                    Format = table.Column<Guid>(type: "uuid", nullable: false),
                    StartDateTime = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    EndDateTime = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    MaxCapacity = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Events", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Events_Formats_Format",
                        column: x => x.Format,
                        principalTable: "Formats",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Events_Games_Game",
                        column: x => x.Game,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Templates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Format = table.Column<Guid>(type: "uuid", nullable: false),
                    DefaultCapacity = table.Column<int>(type: "integer", nullable: false),
                    DefaultDurationMinutes = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Templates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Templates_Formats_Format",
                        column: x => x.Format,
                        principalTable: "Formats",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EventRegistrations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EventId = table.Column<Guid>(type: "uuid", nullable: false),
                    PlayerName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventRegistrations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EventRegistrations_Events_EventId",
                        column: x => x.EventId,
                        principalTable: "Events",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Games",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), "Magic: The Gathering" },
                    { new Guid("22222222-2222-2222-2222-222222222222"), "Flesh and Blood" },
                    { new Guid("33333333-3333-3333-3333-333333333333"), "Lorcana" }
                });

            migrationBuilder.InsertData(
                table: "Formats",
                columns: new[] { "Id", "Game", "Name" },
                values: new object[,]
                {
                    { new Guid("a1a1a1a1-0001-4000-8000-000000000001"), new Guid("11111111-1111-1111-1111-111111111111"), "EDH" },
                    { new Guid("a1a1a1a1-0001-4000-8000-000000000002"), new Guid("11111111-1111-1111-1111-111111111111"), "Standard" },
                    { new Guid("a1a1a1a1-0001-4000-8000-000000000003"), new Guid("11111111-1111-1111-1111-111111111111"), "Modern" },
                    { new Guid("a1a1a1a1-0002-4000-8000-000000000001"), new Guid("22222222-2222-2222-2222-222222222222"), "Classic Constructed (CC)" },
                    { new Guid("a1a1a1a1-0002-4000-8000-000000000002"), new Guid("22222222-2222-2222-2222-222222222222"), "Blitz" },
                    { new Guid("a1a1a1a1-0003-4000-8000-000000000001"), new Guid("33333333-3333-3333-3333-333333333333"), "Core Constructed" },
                    { new Guid("a1a1a1a1-0003-4000-8000-000000000002"), new Guid("33333333-3333-3333-3333-333333333333"), "Infinity Constructed" }
                });

            migrationBuilder.InsertData(
                table: "Templates",
                columns: new[] { "Id", "DefaultCapacity", "DefaultDurationMinutes", "Format", "Name" },
                values: new object[,]
                {
                    { new Guid("b2b2b2b2-0001-4000-8000-000000000001"), 10, 240, new Guid("a1a1a1a1-0001-4000-8000-000000000001"), "MTG - EDH" },
                    { new Guid("b2b2b2b2-0001-4000-8000-000000000002"), 30, 300, new Guid("a1a1a1a1-0001-4000-8000-000000000002"), "MTG - Standard" },
                    { new Guid("b2b2b2b2-0002-4000-8000-000000000001"), 30, 300, new Guid("a1a1a1a1-0002-4000-8000-000000000001"), "FAB - CC" },
                    { new Guid("b2b2b2b2-0003-4000-8000-000000000001"), 30, 300, new Guid("a1a1a1a1-0003-4000-8000-000000000001"), "Lorcana - CC" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_EventRegistrations_EventId",
                table: "EventRegistrations",
                column: "EventId");

            migrationBuilder.CreateIndex(
                name: "IX_Events_Format",
                table: "Events",
                column: "Format");

            migrationBuilder.CreateIndex(
                name: "IX_Events_Game",
                table: "Events",
                column: "Game");

            migrationBuilder.CreateIndex(
                name: "IX_Events_StartDateTime",
                table: "Events",
                column: "StartDateTime");

            migrationBuilder.CreateIndex(
                name: "IX_Formats_Game",
                table: "Formats",
                column: "Game");

            migrationBuilder.CreateIndex(
                name: "IX_Templates_Format",
                table: "Templates",
                column: "Format");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EventRegistrations");

            migrationBuilder.DropTable(
                name: "Templates");

            migrationBuilder.DropTable(
                name: "Events");

            migrationBuilder.DropTable(
                name: "Formats");

            migrationBuilder.DropTable(
                name: "Games");
        }
    }
}

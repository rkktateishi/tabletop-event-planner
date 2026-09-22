using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TabletopEvents.Api.Migrations
{
    /// <inheritdoc />
    public partial class RenameEventRegistrationEventIdToEvent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EventRegistrations_Events_EventId",
                table: "EventRegistrations");

            migrationBuilder.RenameColumn(
                name: "EventId",
                table: "EventRegistrations",
                newName: "Event");

            migrationBuilder.RenameIndex(
                name: "IX_EventRegistrations_EventId",
                table: "EventRegistrations",
                newName: "IX_EventRegistrations_Event");

            migrationBuilder.AddForeignKey(
                name: "FK_EventRegistrations_Events_Event",
                table: "EventRegistrations",
                column: "Event",
                principalTable: "Events",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EventRegistrations_Events_Event",
                table: "EventRegistrations");

            migrationBuilder.RenameColumn(
                name: "Event",
                table: "EventRegistrations",
                newName: "EventId");

            migrationBuilder.RenameIndex(
                name: "IX_EventRegistrations_Event",
                table: "EventRegistrations",
                newName: "IX_EventRegistrations_EventId");

            migrationBuilder.AddForeignKey(
                name: "FK_EventRegistrations_Events_EventId",
                table: "EventRegistrations",
                column: "EventId",
                principalTable: "Events",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigitalMenuSystem.API.Migrations
{
    /// <inheritdoc />
    public partial class AddPreparationAreaToMenuItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PreparationArea",
                table: "MenuItems",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PreparationArea",
                table: "MenuItems");
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigitalMenuSystem.API.Migrations
{
    /// <inheritdoc />
    public partial class AddMultiLanguageAndDualCurrency : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "NameCN",
                table: "MenuItems",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NameEN",
                table: "MenuItems",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NameKH",
                table: "MenuItems",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PriceKHR",
                table: "MenuItems",
                type: "numeric(12,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PriceUSD",
                table: "MenuItems",
                type: "numeric(10,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NameCN",
                table: "MenuItems");

            migrationBuilder.DropColumn(
                name: "NameEN",
                table: "MenuItems");

            migrationBuilder.DropColumn(
                name: "NameKH",
                table: "MenuItems");

            migrationBuilder.DropColumn(
                name: "PriceKHR",
                table: "MenuItems");

            migrationBuilder.DropColumn(
                name: "PriceUSD",
                table: "MenuItems");
        }
    }
}

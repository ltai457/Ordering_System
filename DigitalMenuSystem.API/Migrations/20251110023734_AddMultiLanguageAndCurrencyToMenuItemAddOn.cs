using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigitalMenuSystem.API.Migrations
{
    /// <inheritdoc />
    public partial class AddMultiLanguageAndCurrencyToMenuItemAddOn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "Price",
                table: "MenuItemAddOns",
                type: "numeric(10,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "MenuItemAddOns",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<string>(
                name: "NameCN",
                table: "MenuItemAddOns",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NameEN",
                table: "MenuItemAddOns",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NameKH",
                table: "MenuItemAddOns",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PriceKHR",
                table: "MenuItemAddOns",
                type: "numeric(12,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PriceUSD",
                table: "MenuItemAddOns",
                type: "numeric(10,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NameCN",
                table: "MenuItemAddOns");

            migrationBuilder.DropColumn(
                name: "NameEN",
                table: "MenuItemAddOns");

            migrationBuilder.DropColumn(
                name: "NameKH",
                table: "MenuItemAddOns");

            migrationBuilder.DropColumn(
                name: "PriceKHR",
                table: "MenuItemAddOns");

            migrationBuilder.DropColumn(
                name: "PriceUSD",
                table: "MenuItemAddOns");

            migrationBuilder.AlterColumn<decimal>(
                name: "Price",
                table: "MenuItemAddOns",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(10,2)");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "MenuItemAddOns",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200);
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class updatechangerodentConsuption : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Deteriorated",
                table: "RodentAreas");

            migrationBuilder.DropColumn(
                name: "NoConsumption",
                table: "RodentAreas");

            migrationBuilder.DropColumn(
                name: "Partial",
                table: "RodentAreas");

            migrationBuilder.DropColumn(
                name: "Total",
                table: "RodentAreas");

            migrationBuilder.AddColumn<int>(
                name: "RodentConsumption",
                table: "RodentAreas",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RodentConsumption",
                table: "RodentAreas");

            migrationBuilder.AddColumn<string>(
                name: "Deteriorated",
                table: "RodentAreas",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NoConsumption",
                table: "RodentAreas",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Partial",
                table: "RodentAreas",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Total",
                table: "RodentAreas",
                type: "text",
                nullable: true);
        }
    }
}

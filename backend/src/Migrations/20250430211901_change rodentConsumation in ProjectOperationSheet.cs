using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class changerodentConsumationinProjectOperationSheet : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RodentConsumption",
                table: "RodentAreas");

            migrationBuilder.DropColumn(
                name: "RodentConsumption",
                table: "ProjectOperationSheet");

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

            migrationBuilder.AddColumn<string>(
                name: "Deteriorated",
                table: "ProjectOperationSheet",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NoConsumption",
                table: "ProjectOperationSheet",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Partial",
                table: "ProjectOperationSheet",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Total",
                table: "ProjectOperationSheet",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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

            migrationBuilder.DropColumn(
                name: "Deteriorated",
                table: "ProjectOperationSheet");

            migrationBuilder.DropColumn(
                name: "NoConsumption",
                table: "ProjectOperationSheet");

            migrationBuilder.DropColumn(
                name: "Partial",
                table: "ProjectOperationSheet");

            migrationBuilder.DropColumn(
                name: "Total",
                table: "ProjectOperationSheet");

            migrationBuilder.AddColumn<int>(
                name: "RodentConsumption",
                table: "RodentAreas",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "RodentConsumption",
                table: "ProjectOperationSheet",
                type: "integer",
                nullable: true);
        }
    }
}

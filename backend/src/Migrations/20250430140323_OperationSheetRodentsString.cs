using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class OperationSheetRodentsString : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "RodentConsumption", table: "ProjectOperationSheet");

            migrationBuilder.AddColumn<string>(
                name: "RodentConsumptionDeteriorated",
                table: "ProjectOperationSheet",
                type: "text",
                nullable: false,
                defaultValue: ""
            );

            migrationBuilder.AddColumn<string>(
                name: "RodentConsumptionNone",
                table: "ProjectOperationSheet",
                type: "text",
                nullable: false,
                defaultValue: ""
            );

            migrationBuilder.AddColumn<string>(
                name: "RodentConsumptionPartial",
                table: "ProjectOperationSheet",
                type: "text",
                nullable: false,
                defaultValue: ""
            );

            migrationBuilder.AddColumn<string>(
                name: "RodentConsumptionTotal",
                table: "ProjectOperationSheet",
                type: "text",
                nullable: false,
                defaultValue: ""
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RodentConsumptionDeteriorated",
                table: "ProjectOperationSheet"
            );

            migrationBuilder.DropColumn(
                name: "RodentConsumptionNone",
                table: "ProjectOperationSheet"
            );

            migrationBuilder.DropColumn(
                name: "RodentConsumptionPartial",
                table: "ProjectOperationSheet"
            );

            migrationBuilder.DropColumn(
                name: "RodentConsumptionTotal",
                table: "ProjectOperationSheet"
            );

            migrationBuilder.AddColumn<int>(
                name: "RodentConsumption",
                table: "ProjectOperationSheet",
                type: "integer",
                nullable: true
            );
        }
    }
}

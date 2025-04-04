using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class ProjectOperationSheetOptionals : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "RodentConsumption",
                table: "ProjectOperationSheet",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer"
            );

            migrationBuilder.AlterColumn<int>(
                name: "DegreeRodentInfectivity",
                table: "ProjectOperationSheet",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer"
            );

            migrationBuilder.AlterColumn<int>(
                name: "DegreeInsectInfectivity",
                table: "ProjectOperationSheet",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "RodentConsumption",
                table: "ProjectOperationSheet",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true
            );

            migrationBuilder.AlterColumn<int>(
                name: "DegreeRodentInfectivity",
                table: "ProjectOperationSheet",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true
            );

            migrationBuilder.AlterColumn<int>(
                name: "DegreeInsectInfectivity",
                table: "ProjectOperationSheet",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true
            );
        }
    }
}

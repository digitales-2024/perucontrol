using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class OperationsSheetEdit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NebulizacionCebosTotal",
                table: "ProjectOperationSheet"
            );

            migrationBuilder.DropColumn(name: "RatExtermination1", table: "ProjectOperationSheet");

            migrationBuilder.DropColumn(name: "RatExtermination2", table: "ProjectOperationSheet");

            migrationBuilder.DropColumn(name: "RatExtermination3", table: "ProjectOperationSheet");

            migrationBuilder.RenameColumn(
                name: "SanitaryCondition",
                table: "ProjectOperationSheet",
                newName: "NroPlanchasPegantes"
            );

            migrationBuilder.RenameColumn(
                name: "RatExtermination4",
                table: "ProjectOperationSheet",
                newName: "NroJaulasTomahawk"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "NroPlanchasPegantes",
                table: "ProjectOperationSheet",
                newName: "SanitaryCondition"
            );

            migrationBuilder.RenameColumn(
                name: "NroJaulasTomahawk",
                table: "ProjectOperationSheet",
                newName: "RatExtermination4"
            );

            migrationBuilder.AddColumn<bool>(
                name: "NebulizacionCebosTotal",
                table: "ProjectOperationSheet",
                type: "boolean",
                nullable: false,
                defaultValue: false
            );

            migrationBuilder.AddColumn<string>(
                name: "RatExtermination1",
                table: "ProjectOperationSheet",
                type: "text",
                nullable: false,
                defaultValue: ""
            );

            migrationBuilder.AddColumn<string>(
                name: "RatExtermination2",
                table: "ProjectOperationSheet",
                type: "text",
                nullable: false,
                defaultValue: ""
            );

            migrationBuilder.AddColumn<string>(
                name: "RatExtermination3",
                table: "ProjectOperationSheet",
                type: "text",
                nullable: false,
                defaultValue: ""
            );
        }
    }
}

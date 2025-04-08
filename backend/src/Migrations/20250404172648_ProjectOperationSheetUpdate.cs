using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class ProjectOperationSheetUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "ColocacionCebosCebaderos",
                table: "ProjectOperationSheet",
                type: "text",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "boolean"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<bool>(
                name: "ColocacionCebosCebaderos",
                table: "ProjectOperationSheet",
                type: "boolean",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text"
            );
        }
    }
}

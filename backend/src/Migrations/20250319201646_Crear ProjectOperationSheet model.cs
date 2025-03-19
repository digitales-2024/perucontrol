using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class CrearProjectOperationSheetmodel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ProjectOperationSheet_ProjectId",
                table: "ProjectOperationSheet");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectOperationSheet_ProjectId",
                table: "ProjectOperationSheet",
                column: "ProjectId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ProjectOperationSheet_ProjectId",
                table: "ProjectOperationSheet");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectOperationSheet_ProjectId",
                table: "ProjectOperationSheet",
                column: "ProjectId");
        }
    }
}

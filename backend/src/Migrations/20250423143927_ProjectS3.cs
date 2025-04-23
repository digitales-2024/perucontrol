using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class ProjectS3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MurinoMapKey",
                table: "Projects",
                type: "text",
                nullable: true
            );

            migrationBuilder.AddColumn<string>(
                name: "MurinoMapUrl",
                table: "Projects",
                type: "text",
                nullable: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "MurinoMapKey", table: "Projects");

            migrationBuilder.DropColumn(name: "MurinoMapUrl", table: "Projects");
        }
    }
}

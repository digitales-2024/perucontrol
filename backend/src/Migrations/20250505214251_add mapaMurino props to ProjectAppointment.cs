using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class addmapaMurinopropstoProjectAppointment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MurinoMapKey",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "MurinoMapType",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "MurinoMapUrl",
                table: "Projects");

            migrationBuilder.AddColumn<string>(
                name: "MurinoMapKey",
                table: "ProjectAppointment",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MurinoMapType",
                table: "ProjectAppointment",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MurinoMapUrl",
                table: "ProjectAppointment",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MurinoMapKey",
                table: "ProjectAppointment");

            migrationBuilder.DropColumn(
                name: "MurinoMapType",
                table: "ProjectAppointment");

            migrationBuilder.DropColumn(
                name: "MurinoMapUrl",
                table: "ProjectAppointment");

            migrationBuilder.AddColumn<string>(
                name: "MurinoMapKey",
                table: "Projects",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MurinoMapType",
                table: "Projects",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MurinoMapUrl",
                table: "Projects",
                type: "text",
                nullable: true);
        }
    }
}

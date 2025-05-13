using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class addtechnicalDirectorandresponsibletobusiness : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ResponsibleCIP",
                table: "Businesses",
                type: "text",
                nullable: false,
                defaultValue: ""
            );

            migrationBuilder.AddColumn<string>(
                name: "ResponsibleName",
                table: "Businesses",
                type: "text",
                nullable: false,
                defaultValue: ""
            );

            migrationBuilder.AddColumn<string>(
                name: "ResponsiblePosition",
                table: "Businesses",
                type: "text",
                nullable: false,
                defaultValue: ""
            );

            migrationBuilder.AddColumn<string>(
                name: "ThechnicalDirectorCIP",
                table: "Businesses",
                type: "text",
                nullable: false,
                defaultValue: ""
            );

            migrationBuilder.AddColumn<string>(
                name: "ThechnicalDirectorName",
                table: "Businesses",
                type: "text",
                nullable: false,
                defaultValue: ""
            );

            migrationBuilder.AddColumn<string>(
                name: "ThechnicalDirectorPosition",
                table: "Businesses",
                type: "text",
                nullable: false,
                defaultValue: ""
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "ResponsibleCIP", table: "Businesses");

            migrationBuilder.DropColumn(name: "ResponsibleName", table: "Businesses");

            migrationBuilder.DropColumn(name: "ResponsiblePosition", table: "Businesses");

            migrationBuilder.DropColumn(name: "ThechnicalDirectorCIP", table: "Businesses");

            migrationBuilder.DropColumn(name: "ThechnicalDirectorName", table: "Businesses");

            migrationBuilder.DropColumn(name: "ThechnicalDirectorPosition", table: "Businesses");
        }
    }
}

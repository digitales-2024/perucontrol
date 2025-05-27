using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class AppointmentRepresentative : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "CompanyRepresentative", table: "RodentRegisters");

            migrationBuilder.AddColumn<string>(
                name: "CompanyRepresentative",
                table: "ProjectAppointments",
                type: "text",
                nullable: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompanyRepresentative",
                table: "ProjectAppointments"
            );

            migrationBuilder.AddColumn<string>(
                name: "CompanyRepresentative",
                table: "RodentRegisters",
                type: "text",
                nullable: true
            );
        }
    }
}

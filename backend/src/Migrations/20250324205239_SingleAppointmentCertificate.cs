using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class SingleAppointmentCertificate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Certificates_ProjectAppointmentId",
                table: "Certificates"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Certificates_ProjectAppointmentId",
                table: "Certificates",
                column: "ProjectAppointmentId",
                unique: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Certificates_ProjectAppointmentId",
                table: "Certificates"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Certificates_ProjectAppointmentId",
                table: "Certificates",
                column: "ProjectAppointmentId"
            );
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class ReportUnification2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProjectAppointments_CompleteReports_CompleteReportID",
                table: "ProjectAppointments"
            );

            migrationBuilder.RenameColumn(
                name: "CompleteReportID",
                table: "ProjectAppointments",
                newName: "CompleteReportId"
            );

            migrationBuilder.RenameIndex(
                name: "IX_ProjectAppointments_CompleteReportID",
                table: "ProjectAppointments",
                newName: "IX_ProjectAppointments_CompleteReportId"
            );

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectAppointments_CompleteReports_CompleteReportId",
                table: "ProjectAppointments",
                column: "CompleteReportId",
                principalTable: "CompleteReports",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProjectAppointments_CompleteReports_CompleteReportId",
                table: "ProjectAppointments"
            );

            migrationBuilder.RenameColumn(
                name: "CompleteReportId",
                table: "ProjectAppointments",
                newName: "CompleteReportID"
            );

            migrationBuilder.RenameIndex(
                name: "IX_ProjectAppointments_CompleteReportId",
                table: "ProjectAppointments",
                newName: "IX_ProjectAppointments_CompleteReportID"
            );

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectAppointments_CompleteReports_CompleteReportID",
                table: "ProjectAppointments",
                column: "CompleteReportID",
                principalTable: "CompleteReports",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );
        }
    }
}

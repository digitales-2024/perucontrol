using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using PeruControl.Model.Reports;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class ReportUnification : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProjectAppointments_CompleteReports_CompleteReportId",
                table: "ProjectAppointments"
            );

            migrationBuilder.DropColumn(name: "ContentSection5", table: "CompleteReports");

            migrationBuilder.DropColumn(name: "ContentSection6", table: "CompleteReports");

            migrationBuilder.DropColumn(name: "ContentSection7", table: "CompleteReports");

            migrationBuilder.DropColumn(name: "ContentSection8", table: "CompleteReports");

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

            migrationBuilder.RenameColumn(
                name: "ContentSection9",
                table: "CompleteReports",
                newName: "Content"
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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

            migrationBuilder.RenameColumn(
                name: "Content",
                table: "CompleteReports",
                newName: "ContentSection9"
            );

            migrationBuilder.AddColumn<List<ContentSection>>(
                name: "ContentSection5",
                table: "CompleteReports",
                type: "jsonb",
                nullable: false
            );

            migrationBuilder.AddColumn<List<ContentSection>>(
                name: "ContentSection6",
                table: "CompleteReports",
                type: "jsonb",
                nullable: false
            );

            migrationBuilder.AddColumn<List<ContentSection>>(
                name: "ContentSection7",
                table: "CompleteReports",
                type: "jsonb",
                nullable: false
            );

            migrationBuilder.AddColumn<List<ContentSection>>(
                name: "ContentSection8",
                table: "CompleteReports",
                type: "jsonb",
                nullable: false
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
    }
}

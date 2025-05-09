using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class CompleteReportChanges1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CompleteReportId",
                table: "ProjectAppointments",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000")
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "SigningDate",
                table: "CompleteReports",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone"
            );

            migrationBuilder.CreateIndex(
                name: "IX_ProjectAppointments_CompleteReportId",
                table: "ProjectAppointments",
                column: "CompleteReportId"
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

            migrationBuilder.DropIndex(
                name: "IX_ProjectAppointments_CompleteReportId",
                table: "ProjectAppointments"
            );

            migrationBuilder.DropColumn(name: "CompleteReportId", table: "ProjectAppointments");

            migrationBuilder.AlterColumn<DateTime>(
                name: "SigningDate",
                table: "CompleteReports",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true
            );
        }
    }
}

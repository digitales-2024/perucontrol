using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class ProjectChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Certificates_Projects_ProjectId",
                table: "Certificates"
            );

            migrationBuilder.RenameColumn(
                name: "ProjectId",
                table: "Certificates",
                newName: "ProjectAppointmentId"
            );

            migrationBuilder.RenameIndex(
                name: "IX_Certificates_ProjectId",
                table: "Certificates",
                newName: "IX_Certificates_ProjectAppointmentId"
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "DueDate",
                table: "ProjectAppointments",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true
            );

            migrationBuilder.AddForeignKey(
                name: "FK_Certificates_ProjectAppointments_ProjectAppointmentId",
                table: "Certificates",
                column: "ProjectAppointmentId",
                principalTable: "ProjectAppointments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Certificates_ProjectAppointments_ProjectAppointmentId",
                table: "Certificates"
            );

            migrationBuilder.RenameColumn(
                name: "ProjectAppointmentId",
                table: "Certificates",
                newName: "ProjectId"
            );

            migrationBuilder.RenameIndex(
                name: "IX_Certificates_ProjectAppointmentId",
                table: "Certificates",
                newName: "IX_Certificates_ProjectId"
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "DueDate",
                table: "ProjectAppointments",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone"
            );

            migrationBuilder.AddForeignKey(
                name: "FK_Certificates_Projects_ProjectId",
                table: "Certificates",
                column: "ProjectId",
                principalTable: "Projects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );
        }
    }
}

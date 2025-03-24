using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class AppointmentRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Certificates_ProjectAppointments_ProjectAppointmentId",
                table: "Certificates"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_ProjectAppointments_Projects_ProjectId",
                table: "ProjectAppointments"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_ProjectOperationSheet_ProjectAppointments_ProjectAppointmen~",
                table: "ProjectOperationSheet"
            );

            migrationBuilder.DropPrimaryKey(
                name: "PK_ProjectAppointments",
                table: "ProjectAppointments"
            );

            migrationBuilder.RenameTable(
                name: "ProjectAppointments",
                newName: "ProjectAppointment"
            );

            migrationBuilder.RenameIndex(
                name: "IX_ProjectAppointments_ProjectId",
                table: "ProjectAppointment",
                newName: "IX_ProjectAppointment_ProjectId"
            );

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProjectAppointment",
                table: "ProjectAppointment",
                column: "Id"
            );

            migrationBuilder.AddForeignKey(
                name: "FK_Certificates_ProjectAppointment_ProjectAppointmentId",
                table: "Certificates",
                column: "ProjectAppointmentId",
                principalTable: "ProjectAppointment",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectAppointment_Projects_ProjectId",
                table: "ProjectAppointment",
                column: "ProjectId",
                principalTable: "Projects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectOperationSheet_ProjectAppointment_ProjectAppointment~",
                table: "ProjectOperationSheet",
                column: "ProjectAppointmentId",
                principalTable: "ProjectAppointment",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Certificates_ProjectAppointment_ProjectAppointmentId",
                table: "Certificates"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_ProjectAppointment_Projects_ProjectId",
                table: "ProjectAppointment"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_ProjectOperationSheet_ProjectAppointment_ProjectAppointment~",
                table: "ProjectOperationSheet"
            );

            migrationBuilder.DropPrimaryKey(
                name: "PK_ProjectAppointment",
                table: "ProjectAppointment"
            );

            migrationBuilder.RenameTable(
                name: "ProjectAppointment",
                newName: "ProjectAppointments"
            );

            migrationBuilder.RenameIndex(
                name: "IX_ProjectAppointment_ProjectId",
                table: "ProjectAppointments",
                newName: "IX_ProjectAppointments_ProjectId"
            );

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProjectAppointments",
                table: "ProjectAppointments",
                column: "Id"
            );

            migrationBuilder.AddForeignKey(
                name: "FK_Certificates_ProjectAppointments_ProjectAppointmentId",
                table: "Certificates",
                column: "ProjectAppointmentId",
                principalTable: "ProjectAppointments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectAppointments_Projects_ProjectId",
                table: "ProjectAppointments",
                column: "ProjectId",
                principalTable: "Projects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectOperationSheet_ProjectAppointments_ProjectAppointmen~",
                table: "ProjectOperationSheet",
                column: "ProjectAppointmentId",
                principalTable: "ProjectAppointments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );
        }
    }
}

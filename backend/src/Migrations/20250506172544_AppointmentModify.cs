using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class AppointmentModify : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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
                name: "FK_ProjectAppointmentService_ProjectAppointment_AppointmentsId",
                table: "ProjectAppointmentService"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_ProjectOperationSheet_ProjectAppointment_ProjectAppointment~",
                table: "ProjectOperationSheet"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_RodentRegisters_ProjectAppointment_ProjectAppointmentId",
                table: "RodentRegisters"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_TreatmentArea_ProjectAppointment_ProjectAppointmentId",
                table: "TreatmentArea"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_TreatmentProduct_ProjectAppointment_ProjectAppointmentId",
                table: "TreatmentProduct"
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
                name: "FK_ProjectAppointmentService_ProjectAppointments_AppointmentsId",
                table: "ProjectAppointmentService",
                column: "AppointmentsId",
                principalTable: "ProjectAppointments",
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

            migrationBuilder.AddForeignKey(
                name: "FK_RodentRegisters_ProjectAppointments_ProjectAppointmentId",
                table: "RodentRegisters",
                column: "ProjectAppointmentId",
                principalTable: "ProjectAppointments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "FK_TreatmentArea_ProjectAppointments_ProjectAppointmentId",
                table: "TreatmentArea",
                column: "ProjectAppointmentId",
                principalTable: "ProjectAppointments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "FK_TreatmentProduct_ProjectAppointments_ProjectAppointmentId",
                table: "TreatmentProduct",
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

            migrationBuilder.DropForeignKey(
                name: "FK_ProjectAppointments_Projects_ProjectId",
                table: "ProjectAppointments"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_ProjectAppointmentService_ProjectAppointments_AppointmentsId",
                table: "ProjectAppointmentService"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_ProjectOperationSheet_ProjectAppointments_ProjectAppointmen~",
                table: "ProjectOperationSheet"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_RodentRegisters_ProjectAppointments_ProjectAppointmentId",
                table: "RodentRegisters"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_TreatmentArea_ProjectAppointments_ProjectAppointmentId",
                table: "TreatmentArea"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_TreatmentProduct_ProjectAppointments_ProjectAppointmentId",
                table: "TreatmentProduct"
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
                name: "FK_ProjectAppointmentService_ProjectAppointment_AppointmentsId",
                table: "ProjectAppointmentService",
                column: "AppointmentsId",
                principalTable: "ProjectAppointment",
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

            migrationBuilder.AddForeignKey(
                name: "FK_RodentRegisters_ProjectAppointment_ProjectAppointmentId",
                table: "RodentRegisters",
                column: "ProjectAppointmentId",
                principalTable: "ProjectAppointment",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "FK_TreatmentArea_ProjectAppointment_ProjectAppointmentId",
                table: "TreatmentArea",
                column: "ProjectAppointmentId",
                principalTable: "ProjectAppointment",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "FK_TreatmentProduct_ProjectAppointment_ProjectAppointmentId",
                table: "TreatmentProduct",
                column: "ProjectAppointmentId",
                principalTable: "ProjectAppointment",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );
        }
    }
}

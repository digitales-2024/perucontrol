using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class Changes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RodentArea_RodentRegister_RodentRegisterId",
                table: "RodentArea"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_RodentRegister_ProjectAppointment_ProjectAppointmentId",
                table: "RodentRegister"
            );

            migrationBuilder.DropPrimaryKey(name: "PK_RodentRegister", table: "RodentRegister");

            migrationBuilder.DropPrimaryKey(name: "PK_RodentArea", table: "RodentArea");

            migrationBuilder.RenameTable(name: "RodentRegister", newName: "RodentRegisters");

            migrationBuilder.RenameTable(name: "RodentArea", newName: "RodentAreas");

            migrationBuilder.RenameIndex(
                name: "IX_RodentRegister_ProjectAppointmentId",
                table: "RodentRegisters",
                newName: "IX_RodentRegisters_ProjectAppointmentId"
            );

            migrationBuilder.RenameIndex(
                name: "IX_RodentArea_RodentRegisterId",
                table: "RodentAreas",
                newName: "IX_RodentAreas_RodentRegisterId"
            );

            migrationBuilder.AddPrimaryKey(
                name: "PK_RodentRegisters",
                table: "RodentRegisters",
                column: "Id"
            );

            migrationBuilder.AddPrimaryKey(
                name: "PK_RodentAreas",
                table: "RodentAreas",
                column: "Id"
            );

            migrationBuilder.AddForeignKey(
                name: "FK_RodentAreas_RodentRegisters_RodentRegisterId",
                table: "RodentAreas",
                column: "RodentRegisterId",
                principalTable: "RodentRegisters",
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RodentAreas_RodentRegisters_RodentRegisterId",
                table: "RodentAreas"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_RodentRegisters_ProjectAppointment_ProjectAppointmentId",
                table: "RodentRegisters"
            );

            migrationBuilder.DropPrimaryKey(name: "PK_RodentRegisters", table: "RodentRegisters");

            migrationBuilder.DropPrimaryKey(name: "PK_RodentAreas", table: "RodentAreas");

            migrationBuilder.RenameTable(name: "RodentRegisters", newName: "RodentRegister");

            migrationBuilder.RenameTable(name: "RodentAreas", newName: "RodentArea");

            migrationBuilder.RenameIndex(
                name: "IX_RodentRegisters_ProjectAppointmentId",
                table: "RodentRegister",
                newName: "IX_RodentRegister_ProjectAppointmentId"
            );

            migrationBuilder.RenameIndex(
                name: "IX_RodentAreas_RodentRegisterId",
                table: "RodentArea",
                newName: "IX_RodentArea_RodentRegisterId"
            );

            migrationBuilder.AddPrimaryKey(
                name: "PK_RodentRegister",
                table: "RodentRegister",
                column: "Id"
            );

            migrationBuilder.AddPrimaryKey(
                name: "PK_RodentArea",
                table: "RodentArea",
                column: "Id"
            );

            migrationBuilder.AddForeignKey(
                name: "FK_RodentArea_RodentRegister_RodentRegisterId",
                table: "RodentArea",
                column: "RodentRegisterId",
                principalTable: "RodentRegister",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "FK_RodentRegister_ProjectAppointment_ProjectAppointmentId",
                table: "RodentRegister",
                column: "ProjectAppointmentId",
                principalTable: "ProjectAppointment",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );
        }
    }
}

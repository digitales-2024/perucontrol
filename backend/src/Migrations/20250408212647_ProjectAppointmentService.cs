using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class ProjectAppointmentService : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_QuotationService_Quotations_ServiceToQuotationId",
                table: "QuotationService");

            migrationBuilder.RenameColumn(
                name: "ServiceToQuotationId",
                table: "QuotationService",
                newName: "QuotationId");

            migrationBuilder.CreateTable(
                name: "ProjectAppointmentService",
                columns: table => new
                {
                    AppointmentsId = table.Column<Guid>(type: "uuid", nullable: false),
                    ServicesId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectAppointmentService", x => new { x.AppointmentsId, x.ServicesId });
                    table.ForeignKey(
                        name: "FK_ProjectAppointmentService_ProjectAppointment_AppointmentsId",
                        column: x => x.AppointmentsId,
                        principalTable: "ProjectAppointment",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectAppointmentService_Services_ServicesId",
                        column: x => x.ServicesId,
                        principalTable: "Services",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProjectAppointmentService_ServicesId",
                table: "ProjectAppointmentService",
                column: "ServicesId");

            migrationBuilder.AddForeignKey(
                name: "FK_QuotationService_Quotations_QuotationId",
                table: "QuotationService",
                column: "QuotationId",
                principalTable: "Quotations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_QuotationService_Quotations_QuotationId",
                table: "QuotationService");

            migrationBuilder.DropTable(
                name: "ProjectAppointmentService");

            migrationBuilder.RenameColumn(
                name: "QuotationId",
                table: "QuotationService",
                newName: "ServiceToQuotationId");

            migrationBuilder.AddForeignKey(
                name: "FK_QuotationService_Quotations_ServiceToQuotationId",
                table: "QuotationService",
                column: "ServiceToQuotationId",
                principalTable: "Quotations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

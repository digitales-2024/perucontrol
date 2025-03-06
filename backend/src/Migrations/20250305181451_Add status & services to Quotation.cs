using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class AddstatusservicestoQuotation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Quotations_Services_ServiceId",
                table: "Quotations"
            );

            migrationBuilder.DropIndex(name: "IX_Quotations_ServiceId", table: "Quotations");

            migrationBuilder.DropColumn(name: "ServiceId", table: "Quotations");

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Quotations",
                type: "integer",
                nullable: false,
                defaultValue: 0
            );

            migrationBuilder.CreateTable(
                name: "QuotationService",
                columns: table => new
                {
                    ServiceToQuotationId = table.Column<Guid>(type: "uuid", nullable: false),
                    ServicesId = table.Column<Guid>(type: "uuid", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey(
                        "PK_QuotationService",
                        x => new { x.ServiceToQuotationId, x.ServicesId }
                    );
                    table.ForeignKey(
                        name: "FK_QuotationService_Quotations_ServiceToQuotationId",
                        column: x => x.ServiceToQuotationId,
                        principalTable: "Quotations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "FK_QuotationService_Services_ServicesId",
                        column: x => x.ServicesId,
                        principalTable: "Services",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "IX_QuotationService_ServicesId",
                table: "QuotationService",
                column: "ServicesId"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "QuotationService");

            migrationBuilder.DropColumn(name: "Status", table: "Quotations");

            migrationBuilder.AddColumn<Guid>(
                name: "ServiceId",
                table: "Quotations",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000")
            );

            migrationBuilder.CreateIndex(
                name: "IX_Quotations_ServiceId",
                table: "Quotations",
                column: "ServiceId"
            );

            migrationBuilder.AddForeignKey(
                name: "FK_Quotations_Services_ServiceId",
                table: "Quotations",
                column: "ServiceId",
                principalTable: "Services",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );
        }
    }
}

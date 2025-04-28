using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class QuotationModified : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Area",
                table: "Quotations");

            migrationBuilder.DropColumn(
                name: "CustomField10",
                table: "Quotations");

            migrationBuilder.DropColumn(
                name: "CustomField6",
                table: "Quotations");

            migrationBuilder.DropColumn(
                name: "Deliverables",
                table: "Quotations");

            migrationBuilder.DropColumn(
                name: "Price",
                table: "Quotations");

            migrationBuilder.DropColumn(
                name: "RequiredAvailability",
                table: "Quotations");

            migrationBuilder.DropColumn(
                name: "ServiceDescription",
                table: "Quotations");

            migrationBuilder.DropColumn(
                name: "ServiceDetail",
                table: "Quotations");

            migrationBuilder.DropColumn(
                name: "ServiceListText",
                table: "Quotations");

            migrationBuilder.DropColumn(
                name: "SpacesCount",
                table: "Quotations");

            migrationBuilder.DropColumn(
                name: "TreatedAreas",
                table: "Quotations");

            migrationBuilder.RenameColumn(
                name: "ServiceTime",
                table: "Quotations",
                newName: "Availability");

            migrationBuilder.AlterColumn<string>(
                name: "Others",
                table: "Quotations",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500);

            migrationBuilder.AddColumn<string>(
                name: "Derodent",
                table: "Quotations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Desinsectant",
                table: "Quotations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Disinfectant",
                table: "Quotations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string[]>(
                name: "TermsAndConditions",
                table: "Quotations",
                type: "text[]",
                maxLength: 10,
                nullable: false,
                defaultValue: new string[0]);

            migrationBuilder.CreateTable(
                name: "QuotationServices",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    QuotationId = table.Column<Guid>(type: "uuid", nullable: false),
                    Amount = table.Column<int>(type: "integer", nullable: false),
                    NameDescription = table.Column<string>(type: "text", nullable: false),
                    Price = table.Column<decimal>(type: "numeric", nullable: true),
                    Accesories = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuotationServices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuotationServices_Quotations_QuotationId",
                        column: x => x.QuotationId,
                        principalTable: "Quotations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_QuotationServices_QuotationId",
                table: "QuotationServices",
                column: "QuotationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "QuotationServices");

            migrationBuilder.DropColumn(
                name: "Derodent",
                table: "Quotations");

            migrationBuilder.DropColumn(
                name: "Desinsectant",
                table: "Quotations");

            migrationBuilder.DropColumn(
                name: "Disinfectant",
                table: "Quotations");

            migrationBuilder.DropColumn(
                name: "TermsAndConditions",
                table: "Quotations");

            migrationBuilder.RenameColumn(
                name: "Availability",
                table: "Quotations",
                newName: "ServiceTime");

            migrationBuilder.AlterColumn<string>(
                name: "Others",
                table: "Quotations",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AddColumn<long>(
                name: "Area",
                table: "Quotations",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<string>(
                name: "CustomField10",
                table: "Quotations",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomField6",
                table: "Quotations",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Deliverables",
                table: "Quotations",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "Price",
                table: "Quotations",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "RequiredAvailability",
                table: "Quotations",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ServiceDescription",
                table: "Quotations",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ServiceDetail",
                table: "Quotations",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ServiceListText",
                table: "Quotations",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<long>(
                name: "SpacesCount",
                table: "Quotations",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<string>(
                name: "TreatedAreas",
                table: "Quotations",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");
        }
    }
}

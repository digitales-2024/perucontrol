using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class QuotationsAlter : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TermsAndConditions",
                table: "Quotations");

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

            migrationBuilder.AddColumn<string>(
                name: "Others",
                table: "Quotations",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PaymentMethod",
                table: "Quotations",
                type: "character varying(100)",
                maxLength: 100,
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
                name: "ServiceAddress",
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

            migrationBuilder.AddColumn<string>(
                name: "ServiceTime",
                table: "Quotations",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TreatedAreas",
                table: "Quotations",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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
                name: "Others",
                table: "Quotations");

            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                table: "Quotations");

            migrationBuilder.DropColumn(
                name: "Price",
                table: "Quotations");

            migrationBuilder.DropColumn(
                name: "RequiredAvailability",
                table: "Quotations");

            migrationBuilder.DropColumn(
                name: "ServiceAddress",
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
                name: "ServiceTime",
                table: "Quotations");

            migrationBuilder.DropColumn(
                name: "TreatedAreas",
                table: "Quotations");

            migrationBuilder.AddColumn<string>(
                name: "TermsAndConditions",
                table: "Quotations",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }
    }
}

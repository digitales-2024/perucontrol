using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class AddSupply : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Quotation_Clients_ClientId",
                table: "Quotation"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_Quotation_Services_ServiceId",
                table: "Quotation"
            );

            migrationBuilder.DropPrimaryKey(name: "PK_Quotation", table: "Quotation");

            migrationBuilder.RenameTable(name: "Quotation", newName: "Quotations");

            migrationBuilder.RenameIndex(
                name: "IX_Quotation_ServiceId",
                table: "Quotations",
                newName: "IX_Quotations_ServiceId"
            );

            migrationBuilder.RenameIndex(
                name: "IX_Quotation_ClientId",
                table: "Quotations",
                newName: "IX_Quotations_ClientId"
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "ModifiedAt",
                table: "ClientLocations",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone"
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "ClientLocations",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone"
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "ModifiedAt",
                table: "Quotations",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone"
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Quotations",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone"
            );

            migrationBuilder.AddPrimaryKey(
                name: "PK_Quotations",
                table: "Quotations",
                column: "Id"
            );

            migrationBuilder.CreateTable(
                name: "Supplies",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(
                        type: "character varying(20)",
                        maxLength: 20,
                        nullable: false
                    ),
                    Unit = table.Column<string>(
                        type: "character varying(20)",
                        maxLength: 20,
                        nullable: false
                    ),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false,
                        defaultValueSql: "NOW()"
                    ),
                    ModifiedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false,
                        defaultValueSql: "NOW()"
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Supplies", x => x.Id);
                }
            );

            migrationBuilder.AddForeignKey(
                name: "FK_Quotations_Clients_ClientId",
                table: "Quotations",
                column: "ClientId",
                principalTable: "Clients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Quotations_Clients_ClientId",
                table: "Quotations"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_Quotations_Services_ServiceId",
                table: "Quotations"
            );

            migrationBuilder.DropTable(name: "Supplies");

            migrationBuilder.DropPrimaryKey(name: "PK_Quotations", table: "Quotations");

            migrationBuilder.RenameTable(name: "Quotations", newName: "Quotation");

            migrationBuilder.RenameIndex(
                name: "IX_Quotations_ServiceId",
                table: "Quotation",
                newName: "IX_Quotation_ServiceId"
            );

            migrationBuilder.RenameIndex(
                name: "IX_Quotations_ClientId",
                table: "Quotation",
                newName: "IX_Quotation_ClientId"
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "ModifiedAt",
                table: "ClientLocations",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()"
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "ClientLocations",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()"
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "ModifiedAt",
                table: "Quotation",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()"
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Quotation",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()"
            );

            migrationBuilder.AddPrimaryKey(name: "PK_Quotation", table: "Quotation", column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Quotation_Clients_ClientId",
                table: "Quotation",
                column: "ClientId",
                principalTable: "Clients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "FK_Quotation_Services_ServiceId",
                table: "Quotation",
                column: "ServiceId",
                principalTable: "Services",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );
        }
    }
}

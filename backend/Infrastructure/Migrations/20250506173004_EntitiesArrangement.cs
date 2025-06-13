using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class EntitiesArrangement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TreatmentArea_ProjectAppointments_ProjectAppointmentId",
                table: "TreatmentArea"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_TreatmentAreaTreatmentProduct_TreatmentArea_TreatmentAreasId",
                table: "TreatmentAreaTreatmentProduct"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_TreatmentAreaTreatmentProduct_TreatmentProduct_TreatmentPro~",
                table: "TreatmentAreaTreatmentProduct"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_TreatmentProduct_ProductAmountSolvent_ProductConcentrationId",
                table: "TreatmentProduct"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_TreatmentProduct_Products_ProductId",
                table: "TreatmentProduct"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_TreatmentProduct_ProjectAppointments_ProjectAppointmentId",
                table: "TreatmentProduct"
            );

            migrationBuilder.DropTable(name: "Supplies");

            migrationBuilder.DropPrimaryKey(name: "PK_TreatmentProduct", table: "TreatmentProduct");

            migrationBuilder.DropPrimaryKey(name: "PK_TreatmentArea", table: "TreatmentArea");

            migrationBuilder.RenameTable(name: "TreatmentProduct", newName: "TreatmentProducts");

            migrationBuilder.RenameTable(name: "TreatmentArea", newName: "TreatmentAreas");

            migrationBuilder.RenameIndex(
                name: "IX_TreatmentProduct_ProjectAppointmentId",
                table: "TreatmentProducts",
                newName: "IX_TreatmentProducts_ProjectAppointmentId"
            );

            migrationBuilder.RenameIndex(
                name: "IX_TreatmentProduct_ProductId",
                table: "TreatmentProducts",
                newName: "IX_TreatmentProducts_ProductId"
            );

            migrationBuilder.RenameIndex(
                name: "IX_TreatmentProduct_ProductConcentrationId",
                table: "TreatmentProducts",
                newName: "IX_TreatmentProducts_ProductConcentrationId"
            );

            migrationBuilder.RenameIndex(
                name: "IX_TreatmentArea_ProjectAppointmentId",
                table: "TreatmentAreas",
                newName: "IX_TreatmentAreas_ProjectAppointmentId"
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "ModifiedAt",
                table: "RodentRegisters",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone"
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "RodentRegisters",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone"
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "ModifiedAt",
                table: "RodentAreas",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone"
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "RodentAreas",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone"
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "ModifiedAt",
                table: "QuotationServices",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone"
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "QuotationServices",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone"
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "ModifiedAt",
                table: "Products",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone"
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Products",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone"
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "ModifiedAt",
                table: "TreatmentProducts",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone"
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "TreatmentProducts",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone"
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "ModifiedAt",
                table: "TreatmentAreas",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone"
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "TreatmentAreas",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone"
            );

            migrationBuilder.AddPrimaryKey(
                name: "PK_TreatmentProducts",
                table: "TreatmentProducts",
                column: "Id"
            );

            migrationBuilder.AddPrimaryKey(
                name: "PK_TreatmentAreas",
                table: "TreatmentAreas",
                column: "Id"
            );

            migrationBuilder.AddForeignKey(
                name: "FK_TreatmentAreas_ProjectAppointments_ProjectAppointmentId",
                table: "TreatmentAreas",
                column: "ProjectAppointmentId",
                principalTable: "ProjectAppointments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "FK_TreatmentAreaTreatmentProduct_TreatmentAreas_TreatmentAreas~",
                table: "TreatmentAreaTreatmentProduct",
                column: "TreatmentAreasId",
                principalTable: "TreatmentAreas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "FK_TreatmentAreaTreatmentProduct_TreatmentProducts_TreatmentPr~",
                table: "TreatmentAreaTreatmentProduct",
                column: "TreatmentProductsId",
                principalTable: "TreatmentProducts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "FK_TreatmentProducts_ProductAmountSolvent_ProductConcentration~",
                table: "TreatmentProducts",
                column: "ProductConcentrationId",
                principalTable: "ProductAmountSolvent",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "FK_TreatmentProducts_Products_ProductId",
                table: "TreatmentProducts",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "FK_TreatmentProducts_ProjectAppointments_ProjectAppointmentId",
                table: "TreatmentProducts",
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
                name: "FK_TreatmentAreas_ProjectAppointments_ProjectAppointmentId",
                table: "TreatmentAreas"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_TreatmentAreaTreatmentProduct_TreatmentAreas_TreatmentAreas~",
                table: "TreatmentAreaTreatmentProduct"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_TreatmentAreaTreatmentProduct_TreatmentProducts_TreatmentPr~",
                table: "TreatmentAreaTreatmentProduct"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_TreatmentProducts_ProductAmountSolvent_ProductConcentration~",
                table: "TreatmentProducts"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_TreatmentProducts_Products_ProductId",
                table: "TreatmentProducts"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_TreatmentProducts_ProjectAppointments_ProjectAppointmentId",
                table: "TreatmentProducts"
            );

            migrationBuilder.DropPrimaryKey(
                name: "PK_TreatmentProducts",
                table: "TreatmentProducts"
            );

            migrationBuilder.DropPrimaryKey(name: "PK_TreatmentAreas", table: "TreatmentAreas");

            migrationBuilder.RenameTable(name: "TreatmentProducts", newName: "TreatmentProduct");

            migrationBuilder.RenameTable(name: "TreatmentAreas", newName: "TreatmentArea");

            migrationBuilder.RenameIndex(
                name: "IX_TreatmentProducts_ProjectAppointmentId",
                table: "TreatmentProduct",
                newName: "IX_TreatmentProduct_ProjectAppointmentId"
            );

            migrationBuilder.RenameIndex(
                name: "IX_TreatmentProducts_ProductId",
                table: "TreatmentProduct",
                newName: "IX_TreatmentProduct_ProductId"
            );

            migrationBuilder.RenameIndex(
                name: "IX_TreatmentProducts_ProductConcentrationId",
                table: "TreatmentProduct",
                newName: "IX_TreatmentProduct_ProductConcentrationId"
            );

            migrationBuilder.RenameIndex(
                name: "IX_TreatmentAreas_ProjectAppointmentId",
                table: "TreatmentArea",
                newName: "IX_TreatmentArea_ProjectAppointmentId"
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "ModifiedAt",
                table: "RodentRegisters",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()"
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "RodentRegisters",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()"
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "ModifiedAt",
                table: "RodentAreas",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()"
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "RodentAreas",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()"
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "ModifiedAt",
                table: "QuotationServices",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()"
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "QuotationServices",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()"
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "ModifiedAt",
                table: "Products",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()"
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Products",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()"
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "ModifiedAt",
                table: "TreatmentProduct",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()"
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "TreatmentProduct",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()"
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "ModifiedAt",
                table: "TreatmentArea",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()"
            );

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "TreatmentArea",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()"
            );

            migrationBuilder.AddPrimaryKey(
                name: "PK_TreatmentProduct",
                table: "TreatmentProduct",
                column: "Id"
            );

            migrationBuilder.AddPrimaryKey(
                name: "PK_TreatmentArea",
                table: "TreatmentArea",
                column: "Id"
            );

            migrationBuilder.CreateTable(
                name: "Supplies",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false,
                        defaultValueSql: "NOW()"
                    ),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    ModifiedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false,
                        defaultValueSql: "NOW()"
                    ),
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
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Supplies", x => x.Id);
                }
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
                name: "FK_TreatmentAreaTreatmentProduct_TreatmentArea_TreatmentAreasId",
                table: "TreatmentAreaTreatmentProduct",
                column: "TreatmentAreasId",
                principalTable: "TreatmentArea",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "FK_TreatmentAreaTreatmentProduct_TreatmentProduct_TreatmentPro~",
                table: "TreatmentAreaTreatmentProduct",
                column: "TreatmentProductsId",
                principalTable: "TreatmentProduct",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "FK_TreatmentProduct_ProductAmountSolvent_ProductConcentrationId",
                table: "TreatmentProduct",
                column: "ProductConcentrationId",
                principalTable: "ProductAmountSolvent",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "FK_TreatmentProduct_Products_ProductId",
                table: "TreatmentProduct",
                column: "ProductId",
                principalTable: "Products",
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
    }
}

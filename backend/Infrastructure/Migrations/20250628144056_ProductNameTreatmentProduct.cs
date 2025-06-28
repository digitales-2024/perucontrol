using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class ProductNameTreatmentProduct : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TreatmentProducts_ProductAmountSolvent_ProductAmountSolvent~",
                table: "TreatmentProducts");

            migrationBuilder.DropForeignKey(
                name: "FK_TreatmentProducts_Products_ProductId",
                table: "TreatmentProducts");

            migrationBuilder.DropIndex(
                name: "IX_TreatmentProducts_ProductAmountSolventId",
                table: "TreatmentProducts");

            migrationBuilder.DropIndex(
                name: "IX_TreatmentProducts_ProductId",
                table: "TreatmentProducts");

            migrationBuilder.DropColumn(
                name: "ProductAmountSolventId",
                table: "TreatmentProducts");

            migrationBuilder.DropColumn(
                name: "ProductId",
                table: "TreatmentProducts");

            migrationBuilder.AddColumn<string>(
                name: "ActiveIngredient",
                table: "TreatmentProducts",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "AmountAndSolvent",
                table: "TreatmentProducts",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ProductName",
                table: "TreatmentProducts",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ActiveIngredient",
                table: "TreatmentProducts");

            migrationBuilder.DropColumn(
                name: "AmountAndSolvent",
                table: "TreatmentProducts");

            migrationBuilder.DropColumn(
                name: "ProductName",
                table: "TreatmentProducts");

            migrationBuilder.AddColumn<Guid>(
                name: "ProductAmountSolventId",
                table: "TreatmentProducts",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "ProductId",
                table: "TreatmentProducts",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_TreatmentProducts_ProductAmountSolventId",
                table: "TreatmentProducts",
                column: "ProductAmountSolventId");

            migrationBuilder.CreateIndex(
                name: "IX_TreatmentProducts_ProductId",
                table: "TreatmentProducts",
                column: "ProductId");

            migrationBuilder.AddForeignKey(
                name: "FK_TreatmentProducts_ProductAmountSolvent_ProductAmountSolvent~",
                table: "TreatmentProducts",
                column: "ProductAmountSolventId",
                principalTable: "ProductAmountSolvent",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TreatmentProducts_Products_ProductId",
                table: "TreatmentProducts",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class Products2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductAmountSolvents_Products_ProductId",
                table: "ProductAmountSolvents"
            );

            migrationBuilder.DropPrimaryKey(
                name: "PK_ProductAmountSolvents",
                table: "ProductAmountSolvents"
            );

            migrationBuilder.RenameTable(
                name: "ProductAmountSolvents",
                newName: "ProductAmountSolvent"
            );

            migrationBuilder.RenameIndex(
                name: "IX_ProductAmountSolvents_ProductId",
                table: "ProductAmountSolvent",
                newName: "IX_ProductAmountSolvent_ProductId"
            );

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProductAmountSolvent",
                table: "ProductAmountSolvent",
                column: "Id"
            );

            migrationBuilder.AddForeignKey(
                name: "FK_ProductAmountSolvent_Products_ProductId",
                table: "ProductAmountSolvent",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductAmountSolvent_Products_ProductId",
                table: "ProductAmountSolvent"
            );

            migrationBuilder.DropPrimaryKey(
                name: "PK_ProductAmountSolvent",
                table: "ProductAmountSolvent"
            );

            migrationBuilder.RenameTable(
                name: "ProductAmountSolvent",
                newName: "ProductAmountSolvents"
            );

            migrationBuilder.RenameIndex(
                name: "IX_ProductAmountSolvent_ProductId",
                table: "ProductAmountSolvents",
                newName: "IX_ProductAmountSolvents_ProductId"
            );

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProductAmountSolvents",
                table: "ProductAmountSolvents",
                column: "Id"
            );

            migrationBuilder.AddForeignKey(
                name: "FK_ProductAmountSolvents_Products_ProductId",
                table: "ProductAmountSolvents",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );
        }
    }
}

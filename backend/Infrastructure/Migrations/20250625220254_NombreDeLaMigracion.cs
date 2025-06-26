using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class NombreDeLaMigracion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(name: "PK_PurchaseOrders", table: "PurchaseOrders");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PurchaseOrders",
                table: "PurchaseOrders",
                column: "Id"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(name: "PK_PurchaseOrders", table: "PurchaseOrders");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PurchaseOrders",
                table: "PurchaseOrders",
                column: "Number"
            );
        }
    }
}

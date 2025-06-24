using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class AppointmentProductAdjustments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TreatmentProducts_ProductAmountSolvent_ProductConcentration~",
                table: "TreatmentProducts"
            );

            migrationBuilder.RenameColumn(
                name: "ProductConcentrationId",
                table: "TreatmentProducts",
                newName: "ProductAmountSolventId"
            );

            migrationBuilder.RenameIndex(
                name: "IX_TreatmentProducts_ProductConcentrationId",
                table: "TreatmentProducts",
                newName: "IX_TreatmentProducts_ProductAmountSolventId"
            );

            migrationBuilder.AlterColumn<string>(
                name: "EquipmentUsed",
                table: "TreatmentProducts",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text"
            );

            migrationBuilder.AlterColumn<string>(
                name: "AppliedTime",
                table: "TreatmentProducts",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text"
            );

            migrationBuilder.AlterColumn<string>(
                name: "AppliedTechnique",
                table: "TreatmentProducts",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text"
            );

            migrationBuilder.AlterColumn<string>(
                name: "AppliedService",
                table: "TreatmentProducts",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text"
            );

            migrationBuilder.AddForeignKey(
                name: "FK_TreatmentProducts_ProductAmountSolvent_ProductAmountSolvent~",
                table: "TreatmentProducts",
                column: "ProductAmountSolventId",
                principalTable: "ProductAmountSolvent",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TreatmentProducts_ProductAmountSolvent_ProductAmountSolvent~",
                table: "TreatmentProducts"
            );

            migrationBuilder.RenameColumn(
                name: "ProductAmountSolventId",
                table: "TreatmentProducts",
                newName: "ProductConcentrationId"
            );

            migrationBuilder.RenameIndex(
                name: "IX_TreatmentProducts_ProductAmountSolventId",
                table: "TreatmentProducts",
                newName: "IX_TreatmentProducts_ProductConcentrationId"
            );

            migrationBuilder.AlterColumn<string>(
                name: "EquipmentUsed",
                table: "TreatmentProducts",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true
            );

            migrationBuilder.AlterColumn<string>(
                name: "AppliedTime",
                table: "TreatmentProducts",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true
            );

            migrationBuilder.AlterColumn<string>(
                name: "AppliedTechnique",
                table: "TreatmentProducts",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true
            );

            migrationBuilder.AlterColumn<string>(
                name: "AppliedService",
                table: "TreatmentProducts",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true
            );

            migrationBuilder.AddForeignKey(
                name: "FK_TreatmentProducts_ProductAmountSolvent_ProductConcentration~",
                table: "TreatmentProducts",
                column: "ProductConcentrationId",
                principalTable: "ProductAmountSolvent",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );
        }
    }
}

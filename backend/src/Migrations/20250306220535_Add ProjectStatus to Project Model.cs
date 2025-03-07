using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class AddProjectStatustoProjectModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Project_Clients_ClientId",
                table: "Project");

            migrationBuilder.DropForeignKey(
                name: "FK_Project_Quotations_QuotationId",
                table: "Project");

            migrationBuilder.DropForeignKey(
                name: "FK_ProjectService_Project_ProjectsId",
                table: "ProjectService");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Project",
                table: "Project");

            migrationBuilder.RenameTable(
                name: "Project",
                newName: "Projects");

            migrationBuilder.RenameIndex(
                name: "IX_Project_QuotationId",
                table: "Projects",
                newName: "IX_Projects_QuotationId");

            migrationBuilder.RenameIndex(
                name: "IX_Project_ClientId",
                table: "Projects",
                newName: "IX_Projects_ClientId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Projects",
                table: "Projects",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Projects_Clients_ClientId",
                table: "Projects",
                column: "ClientId",
                principalTable: "Clients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Projects_Quotations_QuotationId",
                table: "Projects",
                column: "QuotationId",
                principalTable: "Quotations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectService_Projects_ProjectsId",
                table: "ProjectService",
                column: "ProjectsId",
                principalTable: "Projects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Projects_Clients_ClientId",
                table: "Projects");

            migrationBuilder.DropForeignKey(
                name: "FK_Projects_Quotations_QuotationId",
                table: "Projects");

            migrationBuilder.DropForeignKey(
                name: "FK_ProjectService_Projects_ProjectsId",
                table: "ProjectService");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Projects",
                table: "Projects");

            migrationBuilder.RenameTable(
                name: "Projects",
                newName: "Project");

            migrationBuilder.RenameIndex(
                name: "IX_Projects_QuotationId",
                table: "Project",
                newName: "IX_Project_QuotationId");

            migrationBuilder.RenameIndex(
                name: "IX_Projects_ClientId",
                table: "Project",
                newName: "IX_Project_ClientId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Project",
                table: "Project",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Project_Clients_ClientId",
                table: "Project",
                column: "ClientId",
                principalTable: "Clients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Project_Quotations_QuotationId",
                table: "Project",
                column: "QuotationId",
                principalTable: "Quotations",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectService_Project_ProjectsId",
                table: "ProjectService",
                column: "ProjectsId",
                principalTable: "Project",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

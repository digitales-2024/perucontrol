using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class addtypeDocumnetandtypeDocumentValuetoClientandmakeRazonSocialoptional
        : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "RazonSocialValue",
                table: "Clients",
                newName: "TypeDocumentValue"
            );

            migrationBuilder.AlterColumn<string>(
                name: "RazonSocial",
                table: "Clients",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100
            );

            migrationBuilder.AddColumn<string>(
                name: "TypeDocument",
                table: "Clients",
                type: "character varying(3)",
                maxLength: 3,
                nullable: false,
                defaultValue: ""
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "TypeDocument", table: "Clients");

            migrationBuilder.RenameColumn(
                name: "TypeDocumentValue",
                table: "Clients",
                newName: "RazonSocialValue"
            );

            migrationBuilder.AlterColumn<string>(
                name: "RazonSocial",
                table: "Clients",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true
            );
        }
    }
}

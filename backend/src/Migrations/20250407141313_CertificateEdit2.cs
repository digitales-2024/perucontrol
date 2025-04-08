using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class CertificateEdit2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "ProjectNumber", table: "Certificates");

            migrationBuilder.RenameColumn(
                name: "OrderNumber",
                table: "ProjectAppointment",
                newName: "CertificateNumber"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "CertificateNumber",
                table: "ProjectAppointment",
                newName: "OrderNumber"
            );

            migrationBuilder
                .AddColumn<int>(
                    name: "ProjectNumber",
                    table: "Certificates",
                    type: "integer",
                    nullable: false,
                    defaultValue: 0
                )
                .Annotation(
                    "Npgsql:ValueGenerationStrategy",
                    NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                );
        }
    }
}

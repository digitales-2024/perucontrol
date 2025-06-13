using System;
using Microsoft.EntityFrameworkCore.Migrations;
using PeruControl.Infrastructure.Model.Reports;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class DisinfectionReportInit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DisinfectionReports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ContentSection = table.Column<ContentSection>(type: "jsonb", nullable: false),
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
                    table.PrimaryKey("PK_DisinfectionReports", x => x.Id);
                }
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "DisinfectionReports");
        }
    }
}

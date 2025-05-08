using System;
using Microsoft.EntityFrameworkCore.Migrations;
using PeruControl.Model.Reports;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class CompleteReport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "DisinfectionReports");

            migrationBuilder.CreateTable(
                name: "CompleteReports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SigningDate = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    ContentSection5 = table.Column<ContentSection>(type: "jsonb", nullable: false),
                    ContentSection6 = table.Column<ContentSection>(type: "jsonb", nullable: false),
                    ContentSection7 = table.Column<ContentSection>(type: "jsonb", nullable: false),
                    ContentSection8 = table.Column<ContentSection>(type: "jsonb", nullable: false),
                    ContentSection9 = table.Column<ContentSection>(type: "jsonb", nullable: false),
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
                    table.PrimaryKey("PK_CompleteReports", x => x.Id);
                }
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "CompleteReports");

            migrationBuilder.CreateTable(
                name: "DisinfectionReports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ContentSection = table.Column<ContentSection>(type: "jsonb", nullable: false),
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
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DisinfectionReports", x => x.Id);
                }
            );
        }
    }
}

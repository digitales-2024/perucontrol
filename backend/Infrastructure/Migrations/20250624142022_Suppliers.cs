using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class Suppliers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Suppliers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SupplierNumber = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    RucNumber = table.Column<string>(
                        type: "character varying(11)",
                        maxLength: 11,
                        nullable: false
                    ),
                    BusinessName = table.Column<string>(
                        type: "character varying(150)",
                        maxLength: 150,
                        nullable: true
                    ),
                    BusinessType = table.Column<string>(
                        type: "character varying(250)",
                        maxLength: 250,
                        nullable: true
                    ),
                    Name = table.Column<string>(
                        type: "character varying(100)",
                        maxLength: 100,
                        nullable: false
                    ),
                    FiscalAddress = table.Column<string>(
                        type: "character varying(250)",
                        maxLength: 250,
                        nullable: false
                    ),
                    Email = table.Column<string>(
                        type: "character varying(50)",
                        maxLength: 50,
                        nullable: false
                    ),
                    PhoneNumber = table.Column<string>(
                        type: "character varying(24)",
                        maxLength: 24,
                        nullable: false
                    ),
                    ContactName = table.Column<string>(
                        type: "character varying(100)",
                        maxLength: 100,
                        nullable: true
                    ),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    ModifiedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Suppliers", x => x.Id);
                }
            );

            migrationBuilder.CreateTable(
                name: "SupplierLocations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SupplierId = table.Column<Guid>(type: "uuid", nullable: false),
                    Address = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    ModifiedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupplierLocations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SupplierLocations_Suppliers_SupplierId",
                        column: x => x.SupplierId,
                        principalTable: "Suppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "IX_SupplierLocations_SupplierId",
                table: "SupplierLocations",
                column: "SupplierId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_RucNumber",
                table: "Suppliers",
                column: "RucNumber",
                unique: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "SupplierLocations");

            migrationBuilder.DropTable(name: "Suppliers");
        }
    }
}

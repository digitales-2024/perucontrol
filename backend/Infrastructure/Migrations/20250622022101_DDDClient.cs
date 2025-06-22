using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class DDDClient : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DomainClients",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TypeDocument = table.Column<string>(
                        type: "character varying(3)",
                        maxLength: 3,
                        nullable: false
                    ),
                    TypeDocumentValue = table.Column<string>(
                        type: "character varying(11)",
                        maxLength: 11,
                        nullable: false
                    ),
                    RazonSocial = table.Column<string>(
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
                    ClientNumber = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    IsActive = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: true
                    ),
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
                    table.PrimaryKey("PK_DomainClients", x => x.Id);
                }
            );

            migrationBuilder.CreateTable(
                name: "DomainClientLocations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Address = table.Column<string>(
                        type: "character varying(250)",
                        maxLength: 250,
                        nullable: false
                    ),
                    ClientId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsActive = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: true
                    ),
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
                    table.PrimaryKey("PK_DomainClientLocations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DomainClientLocations_DomainClients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "DomainClients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "IX_DomainClientLocations_ClientId",
                table: "DomainClientLocations",
                column: "ClientId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_DomainClients_TypeDocumentValue",
                table: "DomainClients",
                column: "TypeDocumentValue",
                unique: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "DomainClientLocations");

            migrationBuilder.DropTable(name: "DomainClients");
        }
    }
}

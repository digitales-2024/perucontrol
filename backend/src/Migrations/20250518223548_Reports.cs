using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using PeruControl.Model.Reports;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class Reports : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "Report1Id",
                table: "ProjectAppointments",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000")
            );

            migrationBuilder.AddColumn<Guid>(
                name: "Report2Id",
                table: "ProjectAppointments",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000")
            );

            migrationBuilder.AddColumn<Guid>(
                name: "Report3Id",
                table: "ProjectAppointments",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000")
            );

            migrationBuilder.AddColumn<Guid>(
                name: "Report4Id",
                table: "ProjectAppointments",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000")
            );

            migrationBuilder.CreateTable(
                name: "Report1s",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SigningDate = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    Content = table.Column<List<ContentSection>>(type: "jsonb", nullable: false),
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
                    table.PrimaryKey("PK_Report1s", x => x.Id);
                }
            );

            migrationBuilder.CreateTable(
                name: "Report2s",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SigningDate = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    Content = table.Column<List<ContentSection>>(type: "jsonb", nullable: false),
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
                    table.PrimaryKey("PK_Report2s", x => x.Id);
                }
            );

            migrationBuilder.CreateTable(
                name: "Report3s",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SigningDate = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    Content = table.Column<List<ContentSection>>(type: "jsonb", nullable: false),
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
                    table.PrimaryKey("PK_Report3s", x => x.Id);
                }
            );

            migrationBuilder.CreateTable(
                name: "Report4s",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SigningDate = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    Content = table.Column<List<ContentSection>>(type: "jsonb", nullable: false),
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
                    table.PrimaryKey("PK_Report4s", x => x.Id);
                }
            );

            migrationBuilder.CreateIndex(
                name: "IX_ProjectAppointments_Report1Id",
                table: "ProjectAppointments",
                column: "Report1Id"
            );

            migrationBuilder.CreateIndex(
                name: "IX_ProjectAppointments_Report2Id",
                table: "ProjectAppointments",
                column: "Report2Id"
            );

            migrationBuilder.CreateIndex(
                name: "IX_ProjectAppointments_Report3Id",
                table: "ProjectAppointments",
                column: "Report3Id"
            );

            migrationBuilder.CreateIndex(
                name: "IX_ProjectAppointments_Report4Id",
                table: "ProjectAppointments",
                column: "Report4Id"
            );

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectAppointments_Report1s_Report1Id",
                table: "ProjectAppointments",
                column: "Report1Id",
                principalTable: "Report1s",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectAppointments_Report2s_Report2Id",
                table: "ProjectAppointments",
                column: "Report2Id",
                principalTable: "Report2s",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectAppointments_Report3s_Report3Id",
                table: "ProjectAppointments",
                column: "Report3Id",
                principalTable: "Report3s",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectAppointments_Report4s_Report4Id",
                table: "ProjectAppointments",
                column: "Report4Id",
                principalTable: "Report4s",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProjectAppointments_Report1s_Report1Id",
                table: "ProjectAppointments"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_ProjectAppointments_Report2s_Report2Id",
                table: "ProjectAppointments"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_ProjectAppointments_Report3s_Report3Id",
                table: "ProjectAppointments"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_ProjectAppointments_Report4s_Report4Id",
                table: "ProjectAppointments"
            );

            migrationBuilder.DropTable(name: "Report1s");

            migrationBuilder.DropTable(name: "Report2s");

            migrationBuilder.DropTable(name: "Report3s");

            migrationBuilder.DropTable(name: "Report4s");

            migrationBuilder.DropIndex(
                name: "IX_ProjectAppointments_Report1Id",
                table: "ProjectAppointments"
            );

            migrationBuilder.DropIndex(
                name: "IX_ProjectAppointments_Report2Id",
                table: "ProjectAppointments"
            );

            migrationBuilder.DropIndex(
                name: "IX_ProjectAppointments_Report3Id",
                table: "ProjectAppointments"
            );

            migrationBuilder.DropIndex(
                name: "IX_ProjectAppointments_Report4Id",
                table: "ProjectAppointments"
            );

            migrationBuilder.DropColumn(name: "Report1Id", table: "ProjectAppointments");

            migrationBuilder.DropColumn(name: "Report2Id", table: "ProjectAppointments");

            migrationBuilder.DropColumn(name: "Report3Id", table: "ProjectAppointments");

            migrationBuilder.DropColumn(name: "Report4Id", table: "ProjectAppointments");
        }
    }
}

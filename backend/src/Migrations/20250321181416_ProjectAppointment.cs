using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class ProjectAppointment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProjectOperationSheet_Projects_ProjectId",
                table: "ProjectOperationSheet"
            );

            migrationBuilder.DropColumn(name: "OrderNumber", table: "Projects");

            migrationBuilder.RenameColumn(
                name: "ProjectId",
                table: "ProjectOperationSheet",
                newName: "ProjectAppointmentId"
            );

            migrationBuilder.RenameIndex(
                name: "IX_ProjectOperationSheet_ProjectId",
                table: "ProjectOperationSheet",
                newName: "IX_ProjectOperationSheet_ProjectAppointmentId"
            );

            migrationBuilder.CreateTable(
                name: "ProjectAppointments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderNumber = table.Column<int>(type: "integer", nullable: true),
                    DueDate = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    ActualDate = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
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
                    table.PrimaryKey("PK_ProjectAppointments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectAppointments_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "ProjectOrderNumbers",
                columns: table => new
                {
                    ProjectOrderNumberId = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    ProjectOrderNumberValue = table.Column<int>(type: "integer", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectOrderNumbers", x => x.ProjectOrderNumberId);
                }
            );

            migrationBuilder.CreateIndex(
                name: "IX_ProjectAppointments_ProjectId",
                table: "ProjectAppointments",
                column: "ProjectId"
            );

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectOperationSheet_ProjectAppointments_ProjectAppointmen~",
                table: "ProjectOperationSheet",
                column: "ProjectAppointmentId",
                principalTable: "ProjectAppointments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProjectOperationSheet_ProjectAppointments_ProjectAppointmen~",
                table: "ProjectOperationSheet"
            );

            migrationBuilder.DropTable(name: "ProjectAppointments");

            migrationBuilder.DropTable(name: "ProjectOrderNumbers");

            migrationBuilder.RenameColumn(
                name: "ProjectAppointmentId",
                table: "ProjectOperationSheet",
                newName: "ProjectId"
            );

            migrationBuilder.RenameIndex(
                name: "IX_ProjectOperationSheet_ProjectAppointmentId",
                table: "ProjectOperationSheet",
                newName: "IX_ProjectOperationSheet_ProjectId"
            );

            migrationBuilder
                .AddColumn<int>(
                    name: "OrderNumber",
                    table: "Projects",
                    type: "integer",
                    nullable: false,
                    defaultValue: 0
                )
                .Annotation(
                    "Npgsql:ValueGenerationStrategy",
                    NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                );

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectOperationSheet_Projects_ProjectId",
                table: "ProjectOperationSheet",
                column: "ProjectId",
                principalTable: "Projects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );
        }
    }
}

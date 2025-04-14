using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class RodentRegister : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RodentRegister",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProjectAppointmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    ServiceDate = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    EnterTime = table.Column<DateOnly>(type: "date", nullable: false),
                    LeaveTime = table.Column<DateOnly>(type: "date", nullable: false),
                    Incidents = table.Column<string>(type: "text", nullable: false),
                    CorrectiveMeasures = table.Column<string>(type: "text", nullable: false),
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
                    table.PrimaryKey("PK_RodentRegister", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RodentRegister_ProjectAppointment_ProjectAppointmentId",
                        column: x => x.ProjectAppointmentId,
                        principalTable: "ProjectAppointment",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "RodentArea",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RodentRegisterId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    CebaderoTrampa = table.Column<int>(type: "integer", nullable: false),
                    Frequency = table.Column<int>(type: "integer", nullable: false),
                    RodentConsumption = table.Column<int>(type: "integer", nullable: false),
                    RodentResult = table.Column<int>(type: "integer", nullable: false),
                    RodentMaterials = table.Column<int>(type: "integer", nullable: false),
                    ProductName = table.Column<string>(type: "text", nullable: false),
                    ProductDose = table.Column<string>(type: "text", nullable: false),
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
                    table.PrimaryKey("PK_RodentArea", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RodentArea_RodentRegister_RodentRegisterId",
                        column: x => x.RodentRegisterId,
                        principalTable: "RodentRegister",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "IX_RodentArea_RodentRegisterId",
                table: "RodentArea",
                column: "RodentRegisterId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_RodentRegister_ProjectAppointmentId",
                table: "RodentRegister",
                column: "ProjectAppointmentId",
                unique: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "RodentArea");

            migrationBuilder.DropTable(name: "RodentRegister");
        }
    }
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class ProjectOperationSheet : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProjectOperationSheet",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    OperationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EnterTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    LeaveTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    SanitaryCondition = table.Column<string>(type: "text", nullable: false),
                    TreatedAreas = table.Column<string>(type: "text", nullable: false),
                    Insects = table.Column<string>(type: "text", nullable: false),
                    Rodents = table.Column<string>(type: "text", nullable: false),
                    OtherPlagues = table.Column<string>(type: "text", nullable: false),
                    Insecticide = table.Column<string>(type: "text", nullable: false),
                    Insecticide2 = table.Column<string>(type: "text", nullable: false),
                    Rodenticide = table.Column<string>(type: "text", nullable: false),
                    Desinfectant = table.Column<string>(type: "text", nullable: false),
                    OtherProducts = table.Column<string>(type: "text", nullable: false),
                    InsecticideAmount = table.Column<string>(type: "text", nullable: false),
                    InsecticideAmount2 = table.Column<string>(type: "text", nullable: false),
                    RodenticideAmount = table.Column<string>(type: "text", nullable: false),
                    DesinfectantAmount = table.Column<string>(type: "text", nullable: false),
                    OtherProductsAmount = table.Column<string>(type: "text", nullable: false),
                    RatExtermination1 = table.Column<string>(type: "text", nullable: false),
                    RatExtermination2 = table.Column<string>(type: "text", nullable: false),
                    RatExtermination3 = table.Column<string>(type: "text", nullable: false),
                    RatExtermination4 = table.Column<string>(type: "text", nullable: false),
                    Staff1 = table.Column<string>(type: "text", nullable: false),
                    Staff2 = table.Column<string>(type: "text", nullable: false),
                    Staff3 = table.Column<string>(type: "text", nullable: false),
                    Staff4 = table.Column<string>(type: "text", nullable: false),
                    AspersionManual = table.Column<bool>(type: "boolean", nullable: false),
                    AspercionMotor = table.Column<bool>(type: "boolean", nullable: false),
                    NebulizacionFrio = table.Column<bool>(type: "boolean", nullable: false),
                    NebulizacionCaliente = table.Column<bool>(type: "boolean", nullable: false),
                    NebulizacionCebosTotal = table.Column<bool>(type: "boolean", nullable: false),
                    ColocacionCebosCebaderos = table.Column<bool>(type: "boolean", nullable: false),
                    ColocacionCebosRepuestos = table.Column<bool>(type: "boolean", nullable: false),
                    DegreeInsectInfectivity = table.Column<int>(type: "integer", nullable: false),
                    DegreeRodentInfectivity = table.Column<int>(type: "integer", nullable: false),
                    Observations = table.Column<string>(type: "text", nullable: false),
                    Recommendations = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    ModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectOperationSheet", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectOperationSheet_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProjectOperationSheet_ProjectId",
                table: "ProjectOperationSheet",
                column: "ProjectId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProjectOperationSheet");
        }
    }
}

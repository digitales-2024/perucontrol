using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class AppointmentRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TreatmentArea",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AreaName = table.Column<string>(type: "text", nullable: false),
                    ObservedVector = table.Column<string>(type: "text", nullable: false),
                    InfestationLevel = table.Column<string>(type: "text", nullable: false),
                    PerformedService = table.Column<string>(type: "text", nullable: false),
                    AppliedTechnique = table.Column<string>(type: "text", nullable: false),
                    ProjectAppointmentId = table.Column<Guid>(type: "uuid", nullable: false),
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
                    table.PrimaryKey("PK_TreatmentArea", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TreatmentArea_ProjectAppointment_ProjectAppointmentId",
                        column: x => x.ProjectAppointmentId,
                        principalTable: "ProjectAppointment",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "TreatmentProduct",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductConcentrationId = table.Column<Guid>(type: "uuid", nullable: false),
                    EquipmentUsed = table.Column<string>(type: "text", nullable: false),
                    AppliedTechnique = table.Column<string>(type: "text", nullable: false),
                    AppliedService = table.Column<string>(type: "text", nullable: false),
                    AppliedTime = table.Column<string>(type: "text", nullable: false),
                    ProjectAppointmentId = table.Column<Guid>(type: "uuid", nullable: false),
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
                    table.PrimaryKey("PK_TreatmentProduct", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TreatmentProduct_ProductAmountSolvent_ProductConcentrationId",
                        column: x => x.ProductConcentrationId,
                        principalTable: "ProductAmountSolvent",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "FK_TreatmentProduct_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "FK_TreatmentProduct_ProjectAppointment_ProjectAppointmentId",
                        column: x => x.ProjectAppointmentId,
                        principalTable: "ProjectAppointment",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "TreatmentAreaTreatmentProduct",
                columns: table => new
                {
                    TreatmentAreasId = table.Column<Guid>(type: "uuid", nullable: false),
                    TreatmentProductsId = table.Column<Guid>(type: "uuid", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey(
                        "PK_TreatmentAreaTreatmentProduct",
                        x => new { x.TreatmentAreasId, x.TreatmentProductsId }
                    );
                    table.ForeignKey(
                        name: "FK_TreatmentAreaTreatmentProduct_TreatmentArea_TreatmentAreasId",
                        column: x => x.TreatmentAreasId,
                        principalTable: "TreatmentArea",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "FK_TreatmentAreaTreatmentProduct_TreatmentProduct_TreatmentPro~",
                        column: x => x.TreatmentProductsId,
                        principalTable: "TreatmentProduct",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "IX_TreatmentArea_ProjectAppointmentId",
                table: "TreatmentArea",
                column: "ProjectAppointmentId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_TreatmentAreaTreatmentProduct_TreatmentProductsId",
                table: "TreatmentAreaTreatmentProduct",
                column: "TreatmentProductsId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_TreatmentProduct_ProductConcentrationId",
                table: "TreatmentProduct",
                column: "ProductConcentrationId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_TreatmentProduct_ProductId",
                table: "TreatmentProduct",
                column: "ProductId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_TreatmentProduct_ProjectAppointmentId",
                table: "TreatmentProduct",
                column: "ProjectAppointmentId"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "TreatmentAreaTreatmentProduct");

            migrationBuilder.DropTable(name: "TreatmentArea");

            migrationBuilder.DropTable(name: "TreatmentProduct");
        }
    }
}

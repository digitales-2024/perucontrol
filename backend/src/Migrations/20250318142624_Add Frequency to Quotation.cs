using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class AddFrequencytoQuotation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "Quotations");

            migrationBuilder.AddColumn<int>(
                            name: "Frequency",
                            table: "Quotations",
                            type: "int",
                            nullable: false,
                            defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Quotations",
                type: "nvarchar(max)",
                nullable: true);
            migrationBuilder.DropColumn(
                name: "Frequency",
                table: "Quotations");
        }
    }
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PeruControl.Migrations
{
    /// <inheritdoc />
    public partial class AppointmentEnterLeaveTime : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "EnterTime", table: "RodentRegisters");

            migrationBuilder.DropColumn(name: "LeaveTime", table: "RodentRegisters");

            migrationBuilder.DropColumn(name: "EnterTime", table: "ProjectOperationSheet");

            migrationBuilder.DropColumn(name: "LeaveTime", table: "ProjectOperationSheet");

            migrationBuilder.AddColumn<TimeSpan>(
                name: "EnterTime",
                table: "ProjectAppointment",
                type: "interval",
                nullable: true
            );

            migrationBuilder.AddColumn<TimeSpan>(
                name: "LeaveTime",
                table: "ProjectAppointment",
                type: "interval",
                nullable: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "EnterTime", table: "ProjectAppointment");

            migrationBuilder.DropColumn(name: "LeaveTime", table: "ProjectAppointment");

            migrationBuilder.AddColumn<TimeSpan>(
                name: "EnterTime",
                table: "RodentRegisters",
                type: "interval",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0)
            );

            migrationBuilder.AddColumn<TimeSpan>(
                name: "LeaveTime",
                table: "RodentRegisters",
                type: "interval",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0)
            );

            migrationBuilder.AddColumn<TimeSpan>(
                name: "EnterTime",
                table: "ProjectOperationSheet",
                type: "interval",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0)
            );

            migrationBuilder.AddColumn<TimeSpan>(
                name: "LeaveTime",
                table: "ProjectOperationSheet",
                type: "interval",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0)
            );
        }
    }
}

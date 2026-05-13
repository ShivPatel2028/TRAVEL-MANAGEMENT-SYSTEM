using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TravelManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddTravelReportAndDetailedExpenses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FinalOutcome",
                table: "TravelRequests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IssuesFaced",
                table: "TravelRequests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MeetingDetails",
                table: "TravelRequests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReportSubmittedAt",
                table: "TravelRequests",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TravelSummary",
                table: "TravelRequests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TripTitle",
                table: "TravelRequests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WorkCompleted",
                table: "TravelRequests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "Expenses",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "Expenses",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FinalOutcome",
                table: "TravelRequests");

            migrationBuilder.DropColumn(
                name: "IssuesFaced",
                table: "TravelRequests");

            migrationBuilder.DropColumn(
                name: "MeetingDetails",
                table: "TravelRequests");

            migrationBuilder.DropColumn(
                name: "ReportSubmittedAt",
                table: "TravelRequests");

            migrationBuilder.DropColumn(
                name: "TravelSummary",
                table: "TravelRequests");

            migrationBuilder.DropColumn(
                name: "TripTitle",
                table: "TravelRequests");

            migrationBuilder.DropColumn(
                name: "WorkCompleted",
                table: "TravelRequests");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "Expenses");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "Expenses");
        }
    }
}

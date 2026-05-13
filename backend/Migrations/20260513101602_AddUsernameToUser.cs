using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TravelManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddUsernameToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Amount",
                table: "Expenses",
                newName: "EstimatedAmount");

            migrationBuilder.AddColumn<string>(
                name: "Username",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "FinanceRemarks",
                table: "TravelRequests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "MiscExpenses",
                table: "TravelRequests",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "ActualAmount",
                table: "Expenses",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "BillId",
                table: "Expenses",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Username",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "FinanceRemarks",
                table: "TravelRequests");

            migrationBuilder.DropColumn(
                name: "MiscExpenses",
                table: "TravelRequests");

            migrationBuilder.DropColumn(
                name: "ActualAmount",
                table: "Expenses");

            migrationBuilder.DropColumn(
                name: "BillId",
                table: "Expenses");

            migrationBuilder.RenameColumn(
                name: "EstimatedAmount",
                table: "Expenses",
                newName: "Amount");
        }
    }
}

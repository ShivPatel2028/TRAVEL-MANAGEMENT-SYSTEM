// File: backend/DTOs/TravelRequestDto.cs
using System;
using System.Collections.Generic;

namespace TravelManagementAPI.DTOs
{
    public class TravelRequestDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string EmployeeId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string FromLocation { get; set; } = string.Empty;
        public string ToLocation { get; set; } = string.Empty;
        public DateTime TravelDate { get; set; }
        public DateTime ReturnDate { get; set; }
        public string Purpose { get; set; } = string.Empty;
        public string Transportation { get; set; } = string.Empty;
        public string Accommodation { get; set; } = string.Empty;
        public decimal MiscExpenses { get; set; }
        public string ManagerRemarks { get; set; } = string.Empty;
        public string FinanceRemarks { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal RequestedBudget { get; set; }
        public decimal? ApprovedBudget { get; set; }
        public string? ApprovedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        
        // Report Fields
        public string? TripTitle { get; set; }
        public string? WorkCompleted { get; set; }
        public string? MeetingDetails { get; set; }
        public string? TravelSummary { get; set; }
        public string? IssuesFaced { get; set; }
        public string? FinalOutcome { get; set; }
        public DateTime? ReportSubmittedAt { get; set; }

        public decimal ActualExpense { get; set; }
        public List<ExpenseDto> Expenses { get; set; } = new();
        public List<BillDto> Bills { get; set; } = new();
        public List<RequestLogDto> Logs { get; set; } = new();
    }

    public class RejectRequestDto
    {
        public string? Remarks { get; set; }
    }

    public class ExpenseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // Category
        public decimal EstimatedAmount { get; set; }
        public decimal ActualAmount { get; set; }
        public DateTime Date { get; set; }
        public string? Notes { get; set; }
    }

    public class BillDto
    {
        public int Id { get; set; }
        public string FilePath { get; set; } = string.Empty;
        public DateTime UploadDate { get; set; }
    }

    public class RequestLogDto
    {
        public int Id { get; set; }
        public string Action { get; set; } = string.Empty;
        public string PerformedBy { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }
}

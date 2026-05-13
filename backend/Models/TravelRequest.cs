// File: backend/Models/TravelRequest.cs
using System;
using System.Collections.Generic;

namespace TravelManagementAPI.Models
{
    public class TravelRequest
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string FromLocation { get; set; } = string.Empty;
        public string ToLocation { get; set; } = string.Empty;
        public DateTime TravelDate { get; set; }
        public DateTime ReturnDate { get; set; }
        public string Purpose { get; set; } = string.Empty;
        public string? Transportation { get; set; }
        public string? Accommodation { get; set; }
        public decimal MiscExpenses { get; set; }
        public string Status { get; set; } = "Pending Manager Approval"; // Pending Manager Approval, Manager Approved, Pending Finance Approval, Finance Approved, Rejected by Manager, Rejected by Finance, Trip Completed, Expense Submitted, Reimbursement Approved, Report Generated
        public string? ManagerRemarks { get; set; }
        public string? FinanceRemarks { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public decimal RequestedBudget { get; set; }
        public decimal? ApprovedBudget { get; set; }
        public string? ApprovedBy { get; set; }

        // Post-Travel Report Fields
        public string? TripTitle { get; set; }
        public string? WorkCompleted { get; set; }
        public string? MeetingDetails { get; set; }
        public string? TravelSummary { get; set; }
        public string? IssuesFaced { get; set; }
        public string? FinalOutcome { get; set; }
        public DateTime? ReportSubmittedAt { get; set; }

        public User? User { get; set; }
        public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
        public ICollection<Bill> Bills { get; set; } = new List<Bill>();
        public ICollection<RequestLog> Logs { get; set; } = new List<RequestLog>();
    }
}

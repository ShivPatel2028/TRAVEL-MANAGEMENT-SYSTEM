// File: backend/DTOs/TravelRequestDto.cs
using System;

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
        public string Status { get; set; } = string.Empty;
        public decimal RequestedBudget { get; set; }
        public decimal? ApprovedBudget { get; set; }
        public string? ApprovedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        
        // Expense summary
        public decimal ActualExpense { get; set; }

        public List<ExpenseDto> Expenses { get; set; } = new();
        public List<BillDto> Bills { get; set; } = new();
        public List<RequestLogDto> Logs { get; set; } = new();
    }

    public class ExpenseDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
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

// File: backend/Models/TravelRequest.cs
using System;

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
        public string Status { get; set; } = "Pending";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public decimal RequestedBudget { get; set; }
        public decimal? ApprovedBudget { get; set; }
        public string? ApprovedBy { get; set; }
        public User? User { get; set; }
        public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
        public ICollection<Bill> Bills { get; set; } = new List<Bill>();
        public ICollection<RequestLog> Logs { get; set; } = new List<RequestLog>();
    }
}

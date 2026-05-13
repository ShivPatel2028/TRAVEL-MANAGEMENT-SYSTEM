// File: backend/Models/Expense.cs
using System;

namespace TravelManagementAPI.Models
{
    public class Expense
    {
        public int Id { get; set; }
        public int TravelRequestId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // Category
        public decimal EstimatedAmount { get; set; }
        public decimal ActualAmount { get; set; }
        public DateTime Date { get; set; }
        public string? Notes { get; set; }
        public int? BillId { get; set; } // Reference to the bill


        public TravelRequest? TravelRequest { get; set; }
    }
}

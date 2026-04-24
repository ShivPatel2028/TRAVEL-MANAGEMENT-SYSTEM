using System;

namespace TravelManagementAPI.Models
{
    public class Expense
    {
        public int Id { get; set; }
        public int TravelRequestId { get; set; }
        public string Type { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }

        public TravelRequest? TravelRequest { get; set; }
    }
}

using System;

namespace TravelManagementAPI.Models
{
    public class RequestLog
    {
        public int Id { get; set; }
        public int TravelRequestId { get; set; }
        public string Action { get; set; } = string.Empty;
        public string PerformedBy { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public TravelRequest? TravelRequest { get; set; }
    }
}

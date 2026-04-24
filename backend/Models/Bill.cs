using System;

namespace TravelManagementAPI.Models
{
    public class Bill
    {
        public int Id { get; set; }
        public int TravelRequestId { get; set; }
        public string FilePath { get; set; } = string.Empty;
        public DateTime UploadDate { get; set; } = DateTime.UtcNow;

        public TravelRequest? TravelRequest { get; set; }
    }
}

// File: backend/DTOs/SubmitReportDto.cs
using System.Collections.Generic;

namespace TravelManagementAPI.DTOs
{
    public class SubmitReportDto
    {
        public string TripTitle { get; set; } = string.Empty;
        public string WorkCompleted { get; set; } = string.Empty;
        public string MeetingDetails { get; set; } = string.Empty;
        public string TravelSummary { get; set; } = string.Empty;
        public string IssuesFaced { get; set; } = string.Empty;
        public string FinalOutcome { get; set; } = string.Empty;
    }
}

// File: backend/Models/User.cs
using System;
using System.Collections.Generic;

namespace TravelManagementAPI.Models
{
    public class User
    {
        public int Id { get; set; }
        public string EmployeeId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = "Employee";
        public string? Department { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<TravelRequest> TravelRequests { get; set; } = new List<TravelRequest>();
    }
}

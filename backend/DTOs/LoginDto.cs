// File: backend/DTOs/LoginDto.cs
namespace TravelManagementAPI.DTOs
{
    public class LoginDto
    {
        public string? EmployeeId { get; set; }
        public string? Username { get; set; }
        public string Password { get; set; } = string.Empty;
    }
}

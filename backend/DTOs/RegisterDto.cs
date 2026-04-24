// File: backend/DTOs/RegisterDto.cs
namespace TravelManagementAPI.DTOs
{
    public class RegisterDto
    {
        public string EmployeeId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string ConfirmPassword { get; set; } = string.Empty;
        public string? Department { get; set; }
    }
}

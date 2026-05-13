// File: backend/DTOs/CreateEmployeeDto.cs
namespace TravelManagementAPI.DTOs
{
    public class CreateEmployeeDto
    {
        public string EmployeeId { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? Department { get; set; }
        public string? Designation { get; set; }
        public string Role { get; set; } = "Employee";
    }
}

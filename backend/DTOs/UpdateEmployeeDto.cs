// File: backend/DTOs/UpdateEmployeeDto.cs
namespace TravelManagementAPI.DTOs
{
    public class UpdateEmployeeDto
    {
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Department { get; set; }
        public string? Designation { get; set; }
        public string? Role { get; set; }
        public bool? IsActive { get; set; }
    }
}

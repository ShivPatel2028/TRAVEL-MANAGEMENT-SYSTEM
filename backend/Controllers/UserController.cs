// File: backend/Controllers/UserController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TravelManagementAPI.Data;
using TravelManagementAPI.DTOs;

namespace TravelManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
        }

        // Get current user's profile
        [HttpGet("profile")]
        public IActionResult GetProfile()
        {
            var userIdClaim = User.FindFirst("sub")?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var user = _context.Users.FirstOrDefault(u => u.Id == userId);

            if (user == null)
            {
                return NotFound();
            }

            return Ok(new
            {
                user.Id,
                user.EmployeeId,
                user.Name,
                user.Email,
                user.Role,
                user.Department,
                user.Designation,
                user.PhoneNumber,
                user.JoiningDate,
                user.IsActive,
                user.CreatedAt
            });
        }

        // Update own profile (limited fields)
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateOwnProfile([FromBody] UpdateEmployeeDto request)
        {
            var userIdClaim = User.FindFirst("sub")?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var user = _context.Users.FirstOrDefault(u => u.Id == userId);
            if (user == null) return NotFound();

            // Employees can only update limited fields
            if (!string.IsNullOrEmpty(request.PhoneNumber)) user.PhoneNumber = request.PhoneNumber;
            if (!string.IsNullOrEmpty(request.Name)) user.Name = request.Name;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Profile updated successfully" });
        }

        // Admin/Manager: Get all employees
        [HttpGet("all")]
        public IActionResult GetAllEmployees()
        {
            var userRole = User.FindFirst("role")?.Value
                ?? User.FindFirst(ClaimTypes.Role)?.Value;

            if (userRole != "Admin" && userRole != "Manager")
            {
                return Forbid();
            }

            var employees = _context.Users.Select(u => new
            {
                u.Id,
                u.EmployeeId,
                u.Name,
                u.Email,
                u.Role,
                u.Department,
                u.Designation,
                u.PhoneNumber,
                u.JoiningDate,
                u.IsActive,
                u.CreatedAt
            }).ToList();

            return Ok(employees);
        }

        // Admin/Manager: Get single employee
        [HttpGet("{id}")]
        public IActionResult GetEmployee(int id)
        {
            var userRole = User.FindFirst("role")?.Value
                ?? User.FindFirst(ClaimTypes.Role)?.Value;

            if (userRole != "Admin" && userRole != "Manager")
            {
                return Forbid();
            }

            var user = _context.Users.FirstOrDefault(u => u.Id == id);
            if (user == null) return NotFound();

            return Ok(new
            {
                user.Id,
                user.EmployeeId,
                user.Name,
                user.Email,
                user.Role,
                user.Department,
                user.Designation,
                user.PhoneNumber,
                user.JoiningDate,
                user.IsActive,
                user.CreatedAt
            });
        }

        // Admin/Manager: Update employee details
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEmployee(int id, [FromBody] UpdateEmployeeDto request)
        {
            var userRole = User.FindFirst("role")?.Value
                ?? User.FindFirst(ClaimTypes.Role)?.Value;

            if (userRole != "Admin" && userRole != "Manager")
            {
                return Forbid();
            }

            var user = _context.Users.FirstOrDefault(u => u.Id == id);
            if (user == null) return NotFound();

            if (!string.IsNullOrEmpty(request.Name)) user.Name = request.Name;
            if (!string.IsNullOrEmpty(request.Email)) user.Email = request.Email;
            if (!string.IsNullOrEmpty(request.PhoneNumber)) user.PhoneNumber = request.PhoneNumber;
            if (!string.IsNullOrEmpty(request.Department)) user.Department = request.Department;
            if (!string.IsNullOrEmpty(request.Designation)) user.Designation = request.Designation;
            if (!string.IsNullOrEmpty(request.Role)) user.Role = request.Role;
            if (request.IsActive.HasValue) user.IsActive = request.IsActive.Value;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Employee updated successfully" });
        }

        // Admin/Manager: Delete (deactivate) employee
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmployee(int id)
        {
            var userRole = User.FindFirst("role")?.Value
                ?? User.FindFirst(ClaimTypes.Role)?.Value;

            if (userRole != "Admin" && userRole != "Manager")
            {
                return Forbid();
            }

            var user = _context.Users.FirstOrDefault(u => u.Id == id);
            if (user == null) return NotFound();

            user.IsActive = false;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Employee account deactivated" });
        }

        // Admin/Manager: Reset employee password
        [HttpPut("{id}/reset-password")]
        public async Task<IActionResult> ResetPassword(int id, [FromBody] ResetPasswordDto request)
        {
            var userRole = User.FindFirst("role")?.Value
                ?? User.FindFirst(ClaimTypes.Role)?.Value;

            if (userRole != "Admin" && userRole != "Manager")
            {
                return Forbid();
            }

            if (string.IsNullOrEmpty(request.NewPassword) || request.NewPassword.Length < 6)
            {
                return BadRequest(new { message = "Password must be at least 6 characters" });
            }

            var user = _context.Users.FirstOrDefault(u => u.Id == id);
            if (user == null) return NotFound();

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Password reset successfully" });
        }

        // Dashboard statistics
        [HttpGet("dashboard-stats")]
        public IActionResult GetDashboardStats()
        {
            var userRole = User.FindFirst("role")?.Value
                ?? User.FindFirst(ClaimTypes.Role)?.Value;
            var userIdClaim = User.FindFirst("sub")?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            if (userRole == "Admin" || userRole == "Manager")
            {
                var stats = new
                {
                    TotalEmployees = _context.Users.Count(u => u.IsActive),
                    TotalTravelRequests = _context.TravelRequests.Count(),
                    PendingRequests = _context.TravelRequests.Count(t => t.Status == "Pending"),
                    ApprovedRequests = _context.TravelRequests.Count(t => t.Status == "Approved"),
                    RejectedRequests = _context.TravelRequests.Count(t => t.Status == "Rejected"),
                    RecentRequests = _context.TravelRequests
                        .Include(t => t.User)
                        .OrderByDescending(t => t.CreatedAt)
                        .Take(5)
                        .Select(t => new
                        {
                            t.Id,
                            t.User!.Name,
                            t.User.EmployeeId,
                            t.ToLocation,
                            t.Status,
                            t.CreatedAt
                        }).ToList()
                };
                return Ok(stats);
            }
            else
            {
                var stats = new
                {
                    MyTotalRequests = _context.TravelRequests.Count(t => t.UserId == userId),
                    MyPendingRequests = _context.TravelRequests.Count(t => t.UserId == userId && t.Status == "Pending"),
                    MyApprovedRequests = _context.TravelRequests.Count(t => t.UserId == userId && t.Status == "Approved"),
                    MyRejectedRequests = _context.TravelRequests.Count(t => t.UserId == userId && t.Status == "Rejected"),
                    UpcomingTrips = _context.TravelRequests
                        .Where(t => t.UserId == userId && t.Status == "Approved" && t.TravelDate >= DateTime.UtcNow)
                        .OrderBy(t => t.TravelDate)
                        .Take(5)
                        .Select(t => new
                        {
                            t.Id,
                            t.ToLocation,
                            t.TravelDate,
                            t.ReturnDate,
                            t.Purpose
                        }).ToList()
                };
                return Ok(stats);
            }
        }
    }
}

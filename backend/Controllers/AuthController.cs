// File: backend/Controllers/AuthController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TravelManagementAPI.Data;
using TravelManagementAPI.DTOs;
using TravelManagementAPI.Models;

namespace TravelManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // Login using Employee ID and Password
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDto request)
        {
            if (string.IsNullOrEmpty(request.EmployeeId) && string.IsNullOrEmpty(request.Username))
            {
                return BadRequest(new { message = "Employee ID or Username is required" });
            }

            var user = _context.Users.FirstOrDefault(u => 
                (!string.IsNullOrEmpty(request.EmployeeId) && u.EmployeeId == request.EmployeeId) ||
                (!string.IsNullOrEmpty(request.Username) && u.Username == request.Username));

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid credentials" });
            }

            if (!user.IsActive)
            {
                return Unauthorized(new { message = "Your account has been deactivated. Please contact your manager." });
            }

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                token,
                user = new
                {
                    user.Id,
                    user.EmployeeId,
                    user.Name,
                    user.Email,
                    user.Role,
                    user.Department,
                    user.Designation,
                    user.PhoneNumber,
                    user.IsActive
                }
            });
        }

        // Admin/Manager only: Create a new employee account
        [HttpPost("create-employee")]
        [Authorize]
        public async Task<IActionResult> CreateEmployee([FromBody] CreateEmployeeDto request)
        {
            var userRole = User.FindFirst("role")?.Value
                ?? User.FindFirst(ClaimTypes.Role)?.Value;

            if (userRole != "Admin" && userRole != "Manager")
            {
                return Forbid();
            }

            if (string.IsNullOrEmpty(request.EmployeeId) || string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new { message = "Employee ID, Email, and Password are required" });
            }

            var existingUser = _context.Users.FirstOrDefault(u => u.Email == request.Email || u.EmployeeId == request.EmployeeId);
            if (existingUser != null)
            {
                return BadRequest(new { message = "Email or Employee ID already exists" });
            }

            var user = new User
            {
                EmployeeId = request.EmployeeId,
                Username = request.Username,
                Name = request.Name,
                Email = request.Email,
                PhoneNumber = request.PhoneNumber,
                Department = request.Department,
                Designation = request.Designation,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = request.Role ?? "Employee",
                IsActive = true,
                JoiningDate = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Employee account created successfully", employeeId = user.EmployeeId });
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]!);

            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim("sub", user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim("role", user.Role),
                    new Claim("name", user.Name),
                    new Claim("employeeId", user.EmployeeId)
                }),
                Expires = DateTime.UtcNow.AddHours(8),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}

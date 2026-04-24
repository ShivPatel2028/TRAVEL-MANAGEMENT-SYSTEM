// File: backend/Controllers/AuthController.cs
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

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto request)
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password) || string.IsNullOrEmpty(request.EmployeeId))
            {
                return BadRequest(new { message = "Employee ID, Email, and password are required" });
            }

            if (request.Password != request.ConfirmPassword)
            {
                return BadRequest(new { message = "Passwords do not match" });
            }

            var existingUser = _context.Users.FirstOrDefault(u => u.Email == request.Email || u.EmployeeId == request.EmployeeId);
            if (existingUser != null)
            {
                return BadRequest(new { message = "Email or Employee ID already exists" });
            }

            var user = new User
            {
                EmployeeId = request.EmployeeId,
                Name = request.Name,
                Email = request.Email,
                PhoneNumber = request.PhoneNumber,
                Department = request.Department,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = "Employee"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User registered successfully" });
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDto request)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == request.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                token,
                user = new { user.Id, user.Name, user.Email, user.Role }
            });
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
                    new Claim("name", user.Name)
                }),
                Expires = DateTime.UtcNow.AddHours(1),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}

// File: backend/Controllers/UserController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TravelManagementAPI.Data;

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

            return Ok(new { user.Id, user.Name, user.Email, user.Role });
        }
    }
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelManagementAPI.Data;
using TravelManagementAPI.DTOs;
using TravelManagementAPI.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

namespace TravelManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TravelController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly string _uploadsFolder;

        public TravelController(AppDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
            _uploadsFolder = Path.Combine(_environment.ContentRootPath, "wwwroot", "uploads");
            if (!Directory.Exists(_uploadsFolder))
            {
                Directory.CreateDirectory(_uploadsFolder);
            }
        }

        private string GetUserName() => User.FindFirst("name")?.Value ?? "Unknown";

        [HttpPost("request")]
        public async Task<IActionResult> CreateTravelRequest([FromForm] TravelRequestDto request)
        {
            var userIdClaim = User.FindFirst("sub")?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var travelRequest = new TravelRequest
            {
                UserId = userId,
                FromLocation = request.FromLocation,
                ToLocation = request.ToLocation,
                TravelDate = request.TravelDate,
                ReturnDate = request.ReturnDate,
                Purpose = request.Purpose,
                RequestedBudget = request.RequestedBudget,
                Status = "Pending"
            };

            travelRequest.Logs.Add(new RequestLog
            {
                Action = "Created",
                PerformedBy = GetUserName()
            });

            _context.TravelRequests.Add(travelRequest);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Travel request created successfully", id = travelRequest.Id });
        }

        [HttpGet("all")]
        public IActionResult GetAllTravelRequests()
        {
            var userRole = User.FindFirst("role")?.Value
                ?? User.FindFirst(ClaimTypes.Role)?.Value;
            var userIdClaim = User.FindFirst("sub")?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            IQueryable<TravelRequest> query = _context.TravelRequests
                .Include(t => t.User)
                .Include(t => t.Expenses)
                .Include(t => t.Bills)
                .Include(t => t.Logs);

            if (userRole != "Admin" && userRole != "Manager" && userRole != "Finance")
            {
                query = query.Where(t => t.UserId == userId);
            }

            var requests = query.Select(t => MapToDto(t)).ToList();

            return Ok(requests);
        }

        [HttpGet("my-requests")]
        public IActionResult GetMyRequests()
        {
            var userIdClaim = User.FindFirst("sub")?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var requests = _context.TravelRequests
                .Include(t => t.User)
                .Include(t => t.Expenses)
                .Include(t => t.Bills)
                .Include(t => t.Logs)
                .Where(t => t.UserId == userId)
                .Select(t => MapToDto(t))
                .ToList();

            return Ok(requests);
        }

        [HttpPut("approve/{id}")]
        public async Task<IActionResult> ApproveTravelRequest(int id, [FromBody] ApproveRequestDto request)
        {
            var userRole = User.FindFirst("role")?.Value
                ?? User.FindFirst(ClaimTypes.Role)?.Value;

            if (userRole != "Admin" && userRole != "Manager")
            {
                return Forbid();
            }

            var travelRequest = await _context.TravelRequests.FirstOrDefaultAsync(t => t.Id == id);

            if (travelRequest == null) return NotFound();

            travelRequest.Status = "Approved";
            travelRequest.ApprovedBudget = request.ApprovedBudget ?? travelRequest.RequestedBudget;
            travelRequest.ApprovedBy = GetUserName();

            travelRequest.Logs.Add(new RequestLog
            {
                Action = "Approved",
                PerformedBy = GetUserName()
            });

            _context.TravelRequests.Update(travelRequest);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Travel request approved" });
        }

        [HttpPut("reject/{id}")]
        public async Task<IActionResult> RejectTravelRequest(int id)
        {
            var userRole = User.FindFirst("role")?.Value
                ?? User.FindFirst(ClaimTypes.Role)?.Value;

            if (userRole != "Admin" && userRole != "Manager")
            {
                return Forbid();
            }

            var travelRequest = await _context.TravelRequests.FirstOrDefaultAsync(t => t.Id == id);

            if (travelRequest == null) return NotFound();

            travelRequest.Status = "Rejected";
            travelRequest.Logs.Add(new RequestLog
            {
                Action = "Rejected",
                PerformedBy = GetUserName()
            });

            _context.TravelRequests.Update(travelRequest);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Travel request rejected" });
        }

        [HttpPut("submit-bill/{id}")]
        public async Task<IActionResult> SubmitBill(int id, [FromForm] string expensesJson, [FromForm] List<IFormFile> receipts)
        {
            var travelRequest = await _context.TravelRequests
                .Include(t => t.Expenses)
                .Include(t => t.Bills)
                .Include(t => t.Logs)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (travelRequest == null) return NotFound();

            if (!string.IsNullOrEmpty(expensesJson))
            {
                var expenseDtos = JsonSerializer.Deserialize<List<ExpenseDto>>(expensesJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (expenseDtos != null)
                {
                    foreach (var exp in expenseDtos)
                    {
                        travelRequest.Expenses.Add(new Expense
                        {
                            Type = exp.Type,
                            Amount = exp.Amount,
                            Date = exp.Date
                        });
                    }
                }
            }

            if (receipts != null && receipts.Count > 0)
            {
                foreach (var receipt in receipts)
                {
                    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(receipt.FileName);
                    var filePath = Path.Combine(_uploadsFolder, fileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await receipt.CopyToAsync(stream);
                    }
                    travelRequest.Bills.Add(new Bill
                    {
                        FilePath = "/uploads/" + fileName
                    });
                }
            }

            travelRequest.Status = "BillSubmitted";
            travelRequest.Logs.Add(new RequestLog
            {
                Action = "BillSubmitted",
                PerformedBy = GetUserName()
            });

            _context.TravelRequests.Update(travelRequest);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Bills submitted successfully" });
        }

        [HttpPut("validate-bill/{id}")]
        public async Task<IActionResult> ValidateBill(int id, [FromBody] bool isValid)
        {
            var userRole = User.FindFirst("role")?.Value
                ?? User.FindFirst(ClaimTypes.Role)?.Value;

            if (userRole != "Admin" && userRole != "Finance")
            {
                return Forbid();
            }

            var travelRequest = await _context.TravelRequests.FindAsync(id);
            if (travelRequest == null) return NotFound();

            travelRequest.Status = isValid ? "Reimbursed" : "BillRejected";
            travelRequest.Logs.Add(new RequestLog
            {
                Action = isValid ? "Reimbursed" : "BillRejected",
                PerformedBy = GetUserName()
            });

            _context.TravelRequests.Update(travelRequest);
            await _context.SaveChangesAsync();

            return Ok(new { message = isValid ? "Bill validated and reimbursed" : "Bill rejected" });
        }

        private static TravelRequestDto MapToDto(TravelRequest t)
        {
            return new TravelRequestDto
            {
                Id = t.Id,
                UserId = t.UserId,
                UserName = t.User?.Name ?? "",
                EmployeeId = t.User?.EmployeeId ?? "",
                Email = t.User?.Email ?? "",
                PhoneNumber = t.User?.PhoneNumber ?? "",
                Department = t.User?.Department ?? "",
                FromLocation = t.FromLocation,
                ToLocation = t.ToLocation,
                TravelDate = t.TravelDate,
                ReturnDate = t.ReturnDate,
                Purpose = t.Purpose,
                RequestedBudget = t.RequestedBudget,
                ApprovedBudget = t.ApprovedBudget,
                ApprovedBy = t.ApprovedBy,
                Status = t.Status,
                CreatedAt = t.CreatedAt,
                ActualExpense = t.Expenses?.Sum(e => e.Amount) ?? 0,
                Expenses = t.Expenses?.Select(e => new ExpenseDto { Id = e.Id, Type = e.Type, Amount = e.Amount, Date = e.Date }).ToList() ?? new List<ExpenseDto>(),
                Bills = t.Bills?.Select(b => new BillDto { Id = b.Id, FilePath = b.FilePath, UploadDate = b.UploadDate }).ToList() ?? new List<BillDto>(),
                Logs = t.Logs?.Select(l => new RequestLogDto { Id = l.Id, Action = l.Action, PerformedBy = l.PerformedBy, Timestamp = l.Timestamp }).ToList() ?? new List<RequestLogDto>()
            };
        }
    }
}
